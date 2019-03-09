const express = require('express'),
      path = require('path'),
      bodyParser = require('body-parser'),
      mongoose = require('mongoose'),
      session = require('express-session'),
      expressValidator = require('express-validator'),
      flash = require('connect-flash'),
      passport = require('passport');

// Init app
const app = express();
const PORT = process.env.PORT || 5000;


// View engine setup
app.set('views',path.join(__dirname, 'views'));
app.set('view engine','ejs');
app.use(express.static(path.join(__dirname, 'public')));

// URL Parsing
app.use(bodyParser.urlencoded({extended:false}));

// JSON Parsing
app.use(bodyParser.json());

// Express FileUpload
// app.use(fileUpload());
// Express session
app.use(session({
  secret: 'shh',
  resave: true,
  saveUninitialized: true,
  // cookie: { secure: true }
}))
// Passport Middleware
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());
// Flash initialize
app.use(flash());

// // Global Variable
// app.use((req,res,next)=>{
//   res.locals.success = req.flash('success');
//   res.locals.error   = req.flash('error');
//   next();
// })

// Mongo connection
const dbURI = 'mongodb://dhull442:asdf@market-shard-00-00-l4mhq.mongodb.net:27017,market-shard-00-01-l4mhq.mongodb.net:27017,market-shard-00-02-l4mhq.mongodb.net:27017/test?ssl=true&replicaSet=market-shard-0&authSource=admin&retryWrites=true';
//require('./config/keys').mongoURI;

// Connect to mongo
mongoose.connect(dbURI,{ useNewUrlParser: true })
  .then(()=> console.log('MongoDB connected'))
  .catch(err => console.log(err))

app.locals.errors=null;

// Pages for header
Page= require('./models/page')

Page.find({}).sort({sorting: 1}).exec((err,pages)=>{
  if(err) throw err;
  else {
    app.locals.pages = pages;
  }
})

// Categories for header
Category = require('./models/category')

Category.find((err,pages)=>{
  if(err) throw err;
  else {
    app.locals.categories = pages;
  }
})

// Express validator
app.use(expressValidator({
  errorFormatter: function(param,msg,value){
    var namespace = param.split('.'),
        root = namespace.shift(),
        formParam = root;

    while(namespace.length){
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  },
  customFormatter: {
    isImage: function(value,filename){
      var extension = (path.extname(filename)).toLowerCase();
      if(extension == '.jpg' || extension == '.png' || extension == '.jpeg' )
        return extension;
      else if(extension == ''){
        return '.jpg';
      }
      else {
        return false;
      }
    }
  }
})
);

app.get('*',function(req,res,next){
  res.locals.cart = req.session.cart;
  res.locals.user = req.user || null;
  next();
})

// messages
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Routes
// USER
app.use('/', require('./routes/index'));
app.use('/products',require('./routes/products'));
app.use('/cart',require('./routes/cart'));
app.use('/u',require('./routes/users'));
// ADMIN
app.use('/admin/pages',require('./routes/adminpages'));
app.use('/admin/category',require('./routes/adminCategory'));
app.use('/admin/product',require('./routes/adminProduct'));
app.use('/admin/users',require('./routes/adminusers'))
app.listen(PORT, ()=> {console.log(`Shopping started at ${PORT}`)});
