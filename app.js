const express = require('express');
const helmet = require('helmet');
const bearerToken = require('express-bearer-token');
const path = require('path');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const firebase = require('firebase');
const firebaseAdmin = require("firebase-admin");
const exphbs  = require('express-handlebars');

const logger = require('./shared/logger');
const config = require('./shared/config'); 
const route = require('./routes/index');

const oauthRouter = route.oauthRouter;
const iftttRouter = route.iftttRouter;

const app = express();

// view engine setup

const fs = require('fs') // this engine requires the fs module

// define the template engine
app.engine('html', function (filePath, options, callback) {

  let regStr = '';
  let reg;
  let strArr = [];

  fs.readFile(filePath, function (err, content) {
    if (err) return callback(err)

      let rendered = content.toString();
      

      for(let name in options) {
        if(name === '_locals' || name === 'cache') {
          continue;
        }
        regStr = '#' + name + '#';
        reg = new RegExp(regStr, 'g');
        
        rendered = rendered.replace(reg, options[name]);
        
      }

      return callback(null, rendered)
  });
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');


firebase.initializeApp(config.FIREBASE_CONFIG);
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(config.FIREBASE_ADMIN_CONFIG),
});


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(helmet());
app.use(bearerToken());


app.use(require("morgan")("combined", { 
  stream: logger.stream,
  skip: function (req, res) {
        return res.statusCode > 300
    }
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', oauthRouter);
app.use('/ifttt', iftttRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
