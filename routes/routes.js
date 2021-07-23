
var express = require('express'),
    hbs = require('express-handlebars'),
    router = express.Router(),
    auth = require('../fauna'),
    {sendMail} = require('../sendMail'),
    dotenv = require('dotenv').config(),
    jwt = require('jsonwebtoken');


router.get('/', (req, res) => {
  res.render('index');
});

// Sign Up Routes 
router.get('/signup/', (req, res) => {
  res.render('auth/signup')
})

router.post('/signup/', async (req, res) => {
  try {
    const {username, email, password, confirm_password} = req.body
    if (password !== confirm_password) {
      return res.render('auth/signup', {
        error: 'Passwords field are not the same'
      })
    }
    const user = await auth.createUser(email, username, password)
    let token = jwt.sign(user, process.env.SECRET, {expiresIn: 600})

    if (user) {
      req.session.user = user
      // Send verification mail for confirmation of account using Nodemailer
      sendMail(email, `Hi ${username}!,\nTo verify your account, please click on the link below and signin again. \nhttp://${req.headers.host}/confirm/${token}`, 'Verify your account')
      req.session.save((err) => {console.log(err)})
      return res.redirect('/dashboard/')
    }
  }
  catch (error){
    console.log(error.message);
    res.render('auth/signup', {
      error: error.message
    })
  }
  res.render('auth/signup', {
    error: 'Username or Email is chosen'
  })
})

// Sign In Routes
router.get('/signin/', function(req, res) {
  res.render('auth/signin');
});

router.post('/signin/', async (req, res) => {
  try {
    const {email, password} = req.body
    const user = await auth.loginUser(email, password)
    
    if (user)  {
      req.session.user = user
      req.session.save((err) => console.log(err))
      return res.redirect('/dashboard/')
    }
  }
  catch (error){
    console.log(error.message);
    res.render('auth/signin', {
      error: error.message
    })
  }
  res.render('auth/signin', {
    error: 'Username or Password is incorrect'
  })
});

// Dashboard Routes
router.get('/dashboard/', async (req, res) => {
  try {
    if (req.session.user) {
      const user = req.session.user
      return res.render('dashboard', {user})
    }
  }
  catch (error){
    res.render('dashboard', {
      error: error.message
    })
  }
  res.redirect('/')
});

// Sign Out Routes
router.get('/signout/', (req, res) => {
  req.session.destroy((err) => console.log(err))
  res.redirect('/signin/')
})

// Delete Account Route
router.delete('/delete-account/', async (req, res) => {
  if (req.session.user) {
    auth.deleteUser(req.session.user.id)
    req.session.destroy();
    return res.status(200).json({success: 'Data Deleted Successfully' })
  } else {
    return res.status(400).json({error: 'Not Successfully Deleted'})
  }
})

// confirm token and update user verification status
router.get('/confirm/:token', (req, res) => {
  const token = req.params.token
  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if (err) {
      res.status(400).json({error: 'Invalid Token'})
    } else {
      auth.updateUser(decoded.id, {isVerified: true})
      return res.redirect('/signin')
    }
  })
})

module.exports = router;