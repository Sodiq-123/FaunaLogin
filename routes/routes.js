var express = require('express'),
    router = express.Router(),
    auth = require('../fauna');


router.get('/', function(req, res) {
  res.render('index');
});

// Sign Up Routes 
router.get('/signup/', function(req, res) {
  res.render('auth/signup')
})

router.post('/signup/', async function(req, res) {
  try {
    const {username, email, password, confirm_password} = req.body
    if (password !== confirm_password) {
      return res.render('auth/signup', {
        error: 'Passwords field are not the same'
      })
    }
    const values = await auth.createUser(email, username, password)
    if (values) {
      req.session.user = values
      req.session.save((err) => {console.log(err)})
      return res.redirect('/dashboard/')
    }
  }
  catch (error){
    console.log(error.message);
    res.render('auth/signup')
  }
  res.render('auth/signup', {
    error: 'Username or Email is chosen'
  })
})

// Sign In Routes
router.get('/signin/', function(req, res) {
  res.render('auth/signin');
});

router.post('/signin/', async function(req, res) {
  try {
    const {email, password} = req.body
    const results = await auth.loginUser(email, password)
    
    if (results)  {
      req.session.user = results
      req.session.save((err) => {console.log(err)})
      return res.redirect('/dashboard/')
    }
  }
  catch (error){
    console.log(error.message);
    return res.redirect('/dashboard')
  }
  res.render('auth/signin', {error: 'Invalid Email or Password'})
});

// Dashboard Routes
router.get('/dashboard/', function(req, res) {
  if (req.session.user) {
    res.render('dashboard', {
      user: req.session.user
    })
  } else {
    res.render('auth/signin', {error: 'Please Login to continue'})
  }
})

// Signout Route
router.get('/signout/', function(req, res) {
  req.session.destroy()
  res.redirect('/')
})

// router.delete('/delete-account/', function(req, res) {
//   res.redirect('signup', {success: 'Successfully deleted account'})
// })

router.delete('/delete-account/', function(req, res) {
  if (req.session.user) {
    auth.deleteUser(req.session.user.id)
    req.session.destroy();
    return res.status(200).json({message: 'Data Deleted Successfully' })
  } else {
    return res.status(200).json({message: 'Not Successfully Deleted'})
  }
})
    
module.exports = router;