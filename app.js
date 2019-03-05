const express = require('express'),
      path = require('path'),
      bodyParser = require('body-parser'),
      mongoose = require('mongoose'),
      session = require('express-session'),
      expressValidator = require('express-validator'),
      flash = require('connect-flash'),
      fileUpload = require('express-fileupload');

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
app.use(fileUpload());
// Express session
app.use(session({
  secret: 'shh',
  resave: true,
  saveUninitialized: true,
  // cookie: { secure: true }
}))

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

// messages
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Routes
app.use('/', require('./routes/index'));
app.use('/admin/pages',require('./routes/adminpages'));
app.use('/admin/category',require('./routes/adminCategory'));
app.use('/admin/product',require('./routes/adminProduct'));

app.listen(PORT, ()=> {console.log(`Shopping started at ${PORT}`)});
