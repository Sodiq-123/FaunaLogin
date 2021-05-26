var dayjs = require('dayjs')
  createError = require('http-errors'),
  routes = require('./routes'),
  express = require('express'),
  path = require('path'),
  cookieParser = require('cookie-parser'),
  logger = require('morgan'),
  exphbs = require('express-handlebars'),
  relativeTime = require('dayjs/plugin/relativeTime'),
  dayjs = require('dayjs');


module.exports = function (app) {
  app.engine('handlebars', exphbs.create({
    defaultlayout: '',
    indexRouter: path.join(__dirname, './routes/index'),
    usersRouter: path.join(__dirname, './routes/users'),
    helpers: {
      timeago: function(timestamp) {
        return dayjs(new Date(timestamp).toString()).fromNow();
      }
    }
  }).engine);
  app.set('view engine', 'handlebars');

  app.use(logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser('euweiudhf93832r8735q0faxuhaxsfi23r9r83'));
  // routes(app);
  app.use(routes)


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
