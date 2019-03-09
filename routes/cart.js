const express = require('express');
const router = express.Router();

Product = require('../models/product');

// checkout page
router.get('/checkout',(req,res)=>{
  if(req.session.cart && req.session.cart.length == 0){
    delete req.session.cart;
    res.redirect('/cart/checkout');
  }
  else{
    res.render('checkout',{
      title: 'Checkout',
      cart: req.session.cart
    })
  }
})

// Adding to cart
router.get('/add/:slug',(req,res) => {
  var slug = req.params.slug;
  Product.findOne({slug:req.params.slug},(err,p)=>{
    if(err) throw err;
    if(typeof req.session.cart == 'undefined'){
      req.session.cart = [] ;
      req.session.cart.push({
        title: p.name,
        slug: slug,
        qty: 1,
        price: parseFloat(p.price).toFixed(2)
      })
    }
    else{
      var cart = req.session.cart;
      var newitem = true;
      cart.forEach((item)=>{
        if(item.slug == slug && newitem){
          item.qty = item.qty + 1;
          newitem = false;
        }
      })
      if(newitem){
        cart.push({
          slug: slug,
          title: p.name,
          qty: 1,
          price: parseFloat(p.price).toFixed(2)
        })
      }
    }
    console.log(req.session.cart);
    req.flash('success','Product added!');
    res.redirect('back');
  })
})

// Clear Cart
router.get('/clear',(req,res)=>{
  delete req.session.cart;
  res.redirect('back');
})

// Update cart
router.get('/update/:slug',(req,res)=>{
  cart = req.session.cart;
  action = req.query.action;
  slug = req.params.slug;
  var done = true;
  for(var i = 0 ; i < cart.length; i++){
    if(cart[i].slug == slug && done){
      if(action == 'increase'){
        cart[i].qty++;
        done = false;
      }
      else if(action == 'decrease'){
        cart[i].qty--;
        if(cart[i].qty<=0){
          cart.splice(i,1);
          if(cart.length == 0) delete req.session.cart;
        }
        done = false;
      }
      else if(action == 'remove'){
        cart.splice(i,1);
        if(cart.length == 0) delete req.session.cart;
        done = false;
      }
    }
  }
  if(done){
    console.log(action);
    req.flash('error','Unknown action');
  }
  res.redirect('back');
})

router.get('/proceed',(req,res)=>{
  delete req.session.cart;
  res.send('END OF THE LINE :)')
})
module.exports = router;
