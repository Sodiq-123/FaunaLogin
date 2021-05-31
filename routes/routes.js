var express = require('express'),
    router = express.Router();


router.get('/', function(req, res) {
  res.render('index');
});

router.get('/signin/', function(req, res) {
  res.render('auth/signin');
});

router.get('/signup', function(req, res) {
  res.render('auth/signup')
})
router.get('/dashboard/', function(req, res) {
  res.render()
})

router.get('/signout/', function(req, res) {
  res.redirect('/')
})

router.delete('/delete-account/', function(req, res) {
  res.render('')
})
    
module.exports = router;