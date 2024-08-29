var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const connectToMongoDB = require('./mongoConfig')
const session = require('express-session');
const passport = require('passport')
// routes
var indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const postsRouter = require('./routes/posts');
const commentsRouter = require('./routes/comments');
const usersRouter = require('./routes/users');
const followRouter = require('./routes/follow')
const notificationsRouter = require('./routes/notifications')
const {router: eventRouter} = require('./routes/events')
var app = express();
const MongoStore = require('connect-mongo'); 

const sessionStore = MongoStore.create({
  mongoUrl: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/odin-book',
  collectionName: 'sessions',
});

const cors = require('cors')

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,

}))

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// dotenv
require('dotenv').config();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  saveUninitialized: false,
  resave: false,
  store: sessionStore,
  cookie: {
      maxAge: 24 * 60 * 60 * 1000, 
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
  },
}));


app.use(passport.initialize());
app.use(passport.session());

// use the auth function
require('./auth/index')(passport);

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/events', eventRouter)
app.use('/api', authRouter);
app.use('/api', postsRouter);
app.use('/api', commentsRouter);
app.use('/api', usersRouter);
app.use('/api', followRouter)
app.use('/api', notificationsRouter)
//connect to mongodb
connectToMongoDB().catch(err => console.error(err));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
