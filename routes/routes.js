var express = require('express'),
    router = express.Router();


router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/signin/', function(req, res, next) {
  res.send();
});

router.get('/dashboard/', function(req, res, next) {
  res.send()
})

router.get('/signout/', function(req, res, next) {
  res.send()
})

router.delete('/delete-account/', function(req, res, next) {
  res.send('')
})
    
module.exports = router;