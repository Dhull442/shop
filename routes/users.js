const express = require('express'),
      passport = require('passport'),
      bcrypt = require('bcryptjs');
const router = express.Router();

var User = require('../models/user');


router.get('/register',(req,res)=>
  res.render('register',{title: 'Register'})
);

// register
router.post('/register',(req,res)=> {
  // console.log(req.body);
  const { name, username, password, password2 } = req.body;
  // Check required fields
  let errors = [];

  // Check required fields
  if(!name || !username || !password || !password2 ){
    errors.push({ msg: 'Please fill in all the fields'});
  }
  else
  {
    if(password.length < 6){
      errors.push({msg: 'Password should be at least 6 char long.'});
    }
    else if((password !== password2)){
      errors.push({msg: 'Passwords don\'t match'});
    }
  }
  if(errors.length > 0){
    res.render('register',{
      errors: errors,
      name: name,
      username: username,
      title: 'Register'
    })
    console.log(errors);
  }
  else{
    // Validation Passes:
    // console.log('Validation passes');
    User.findOne({ username: username },user => {
      if(user){
        // User already exists
        errors.push({msg: 'This username is already in use'})
        res.render('register',{
          errors: errors,
          name: name,
          username: username,
          title:'Register'
        });
        console.log(errors);
      }
      else{
        const newUser = new User({
          name: name,
          username: username,
          password: password,
          admin: 1
        });
        // Hash password
        bcrypt.genSalt(10,(err,hashtable)=>{
          bcrypt.hash(newUser.password,hashtable,(err,hash)=>{
            if(err) throw err;
            // Set hashed password
            newUser.password = hash;
            newUser.save()
              .then(user => {
                req.flash('success_reg','You are registered successfully');
                res.redirect('/u/login');
              })
              .catch(err => console.log(err));
          })})
        console.log(newUser)
        };
    });
  };
});

router.get('/login',(req,res) => {
  res.render('login',{
    title: 'Login'
  })
})

router.post('/login',(req,res,next)=>{
  // console.log(req.body);
  const { username, password } = req.body;
  let errors = [];

  // Check required fields:
  if(!username || !password ){
    errors.push({msg: 'Please fill all the fields'});
  }
  else{
    if(password.length < 6){
      errors.push({msg: 'Incorrect password'});
    }
  }
  if(errors.length > 0){
    res.render('login',{
      errors:errors,
      username: username,
      password: password
    });
  }
  else{
    // type pass checks done
    passport.authenticate('local',{
      successRedirect: '/',
      failureRedirect: '/u/login',
      failureFlash : true
    })(req,res,next);
  }
})

// Logout
router.get('/logout',(req,res)=> {
  req.logout();
  delete req.session.cart;
  req.flash('success_reg','You are logged out');
  res.redirect('/');
})
module.exports = router;
