const express = require('express'),
      bcrypt = require('bcryptjs'),
      passport = require('passport');
const router = express.Router();

var User = require('../models/user');

router.get('/',(req,res)=>{
  User.find((err,category)=>{
    res.render('admin/users',{
      title: 'Users',
      users : category
    })
  })

})

router.get('/view/:id',(req,res)=>{
  User.findById(req.params.id,(err,page)=>{
    if(err){
      console.log(err);
    }
    res.render('admin/viewUser',{
      title : 'View User',
      name : page.name,
      username : page.username,
      password: 'Unspecified',
      id : page._id
    })
  })
})



router.get('/delete/:id',(req,res)=>{
  User.findByIdAndDelete(req.params.id,(err,page)=>{
    if(err) throw err;

    req.flash('success','user deleted successfully');
    res.redirect('/admin/users');
  })
})

router.get('/add',(req,res)=>{
  res.render('admin/adduser',{
    title : 'Add User'
  });
})

router.post('/add',(req,res)=>{
  var username =req.body.username;
  var name=req.body.name;
  var password = req.body.password;
  var errors =[];
  console.log(req.body);
  if(!name || !username || !password ){
    errors.push({ msg: 'Please fill in all the fields'});
  }
  else
  {
    if(password.length < 6){
      errors.push({msg: 'Password should be at least 6 char long.'});
    }
  }
  console.log(errors)
  if(errors.length>0){
    console.log(errors)
    res.render('admin/adduser',{
      errors: errors,
      title : 'Add User',
      name: name,
      username: username,
      password: password
    })
  }
  else{
    User.findOne({ username: username }).then(user => {
      if(user){
        // User already exists
        errors.push({msg: 'This username is already in use'})
        res.render('admin/adduser',{
          errors: errors,
          name: name,
          username: username,
          title:'Add User',
          password: password
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
        if (req.body.role == 'admin'){
          newUser.admin = 0;
        }
        // Hash password
        bcrypt.genSalt(10,(err,hashtable)=>{
          bcrypt.hash(newUser.password,hashtable,(err,hash)=>{
            if(err) throw err;
            // Set hashed password
            newUser.password = hash;
            newUser.save()
              .then(user => {
                req.flash('success_reg','You are registered successfully');
                res.redirect('/admin/users');
              })
              .catch(err => console.log(err));
          })})
        console.log(newUser)
        };
    });
  }
})


module.exports = router;
