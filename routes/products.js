const express = require('express');
const router = express.Router();

Product = require('../models/product');


router.get('/',(req,res) => {
  Product.find().then((err,products)=>{
    if(err) throw err;
    res.render('all_products',{
      title: 'All Products',
      products: products
    })
  })
})

router.get('/category/:slug',(req,res) => {
  Category.findOne({slug:req.params.slug},(err,p)=>{
    if(err) throw err;
    if(!p){
      req.flash('danger','Requested Product no longer exist');
      res.redirect('/products');
    }
    else{
      Product.find((err,products)=>{
        if(err) throw err;
        var ourproducts=[],size=0;
        products.forEach((pr)=>{
          if(pr.categories.includes(p.cattitle)){
            ourproducts.push(pr);size = size + 1;
          }

        })
        res.render('all_products',{
          title : `All products from ${p.cattitle}`,
          products: ourproducts
        })
      })
    }
  })
})

router.get('/:slug',(req,res) => {
  var loggedIn = req.isAuthenticated();
  Product.findOne({slug:req.params.slug},(err,p)=>{
    if(err) throw err;
    if(!p){
      req.flash('danger','Requested Product no longer exist');
      res.redirect('/products');
    }
    else{
      res.render('product_view',{
        title : p.name,
        name: p.name,
        price: p.price,
        slug : p.slug,
        description : p.description,
        pcategories: p.categories,
        auth: loggedIn
      })
    }
  })
})

module.exports = router;
