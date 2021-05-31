var dayjs = require('dayjs'),
  createError = require('http-errors'),
  routes = require('./routes/routes')
  express = require('express'),
  session = require('express-session'),
  path = require('path'),
  cookieParser = require('cookie-parser'),
  logger = require('morgan'),
  dotenv = require('dotenv').config(),
  exphbs = require('express-handlebars'),
  relativeTime = require('dayjs/plugin/relativeTime');

module.exports = function (app) {
  app.engine('.hbs', exphbs.create({
    defaultlayout: 'main',
    layoutsDir: path.join(__dirname, './views/layouts'),
    partialsDir: path.join(__dirname, './views/partials'),
    helpers: {
      timeago: function(timestamp) {
        return dayjs(new Date(timestamp).toString()).fromNow();
      }
    },
    extname: '.hbs',
  }).engine);
  app.set('view engine', '.hbs');

  app.use(logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser('euweiudhf93832r8735q0faxuhaxsfi23r9r83'));
  // routes(app);
  app.use(routes)
  app.use(session({
        secret: process.env.SECRET,
        resave: true,
        saveUninitialized: true,
        maxAge: 600
    }))



  app.use('/public/', express.static(path.join(__dirname, './public')));

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    next(createError(404));
  });

  // error handler
  app.use(function(err, req, res) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render('error');
    });

    return app;
};
