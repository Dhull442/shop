const express = require('express'),
      path = require('path'),
      bodyParser = require('body-parser'),
      mongoose = require('mongoose'),
      session = require('express-session');

// Init app
const app = express();
const PORT = process.env.PORT || 5000;

// URL Parsing
app.use(bodyParser.urlencoded({extended:false}));

// JSON Parsing
app.use(bodyParser.json());

// Express session
app.use(session({
  secret: 'shh',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))
// View engine setup
app.set('views',path.join(__dirname, 'views'));
app.set('view engine','ejs');

app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', require('./routes/index'));
app.use('/admin',require('./routes/adminindex'));

app.listen(PORT, ()=> {console.log(`Shopping started at ${PORT}`)});
