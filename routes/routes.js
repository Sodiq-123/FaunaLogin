
var express = require('express'),
    hbs = require('express-handlebars'),
    router = express.Router(),
    auth = require('../fauna'),
    {sendMail} = require('../sendMail'),
    dotenv = require('dotenv').config(),
    { check, validationResult } = require('express-validator');
    jwt = require('jsonwebtoken');


router.get('/', (req, res) => {
  return res.render('index');
});

// Sign Up Routes 
router.get('/signup/', (req, res) => {
  return res.render('auth/signup')
})

router.post('/signup/', [
  check('username')
    .trim()
    .isLength({ min: 5, max: 10 })
    .withMessage('Password must be between 5 and 10 characters'),
  check('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email address')
    .custom(async (email) => {
      const user = await auth.getUserByEmail(email)
      if (user) {
        throw new Error('Email already in use')
      }
    }),
  check('password')
    .trim()
    .isLength({ min: 8, max: 20 })
    .withMessage('Password must be between 8 and 20 characters'),
  check('confirm_password')
    .trim()
    .isLength({ min: 8, max: 20 })
    .withMessage('Password must be between 8 and 20 characters')
    .custom(async (confirm_password, { req }) => {
      if (confirm_password !== req.body.password) {
        throw new Error('Passwords do not match')
      }
    })
], async (req, res) => {
  try {
    const {username, email, password, confirm_password} = req.body
    if (password !== confirm_password) {
      return res.render('auth/signup', {
        error: 'Passwords do not match'
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
    return res.render('auth/signup', {
      error: error.message
    })
  }
  return res.render('auth/signup', {
    error: 'Username or Email is chosen'
  })
})

// Sign In Routes
router.get('/signin/', function(req, res) {
  return res.render('auth/signin');
});

router.post('/signin/', [
  check('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email address')
    .custom(async (email) => {
      const user = await auth.getUserByEmail(email)
      if (user) {
        throw new Error('Email already in use')
      }
    }),
  check('password')
    .trim()
    .isLength({ min: 8, max: 20 })
    .withMessage('Password must be between 8 and 20 characters')
], async (req, res) => {
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
    return res.render('auth/signin', {
      error: 'Invalid Email or Password'
    })
  }
  return res.render('auth/signin', {
    error: 'Invalid Email or Password'
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
    return res.render('dashboard', {
      error: error.message
    })
  }
  return res.redirect('/')
});

// Sign Out Routes
router.get('/signout/', (req, res) => {
  req.session.destroy((err) => console.log(err))
  return res.redirect('/signin/')
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
    try {
      if (err) {
        return res.render('auth/signup', {
          error: 'Invalid Token'
        })
      }
      user = auth.updateUser(decoded.id, {isVerified: true})
      if (user) {
        req.session.user = user
        return res.redirect('/dashboard')
      }
    } catch (error) {
      return res.render('auth/signup', {
        error: 'Invalid Token'
      })
    }
  })
})

module.exports = router;