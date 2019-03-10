const express = require('express'),
      mkdirp = require('mkdirp'),
      fs = require('fs-extra'),
      resizeimg = require('resize-img'),
      fileUpload = require('express-fileupload');
const router = express.Router();
router.use(fileUpload());
var Product = require('../models/product'),
    Category = require('../models/category');

router.get('/',(req,res)=>{
  var count;
  Product.countDocuments().then((err,c)=>{
    if(err) throw err;
    count = c
  });
  Product.find().then((err,products)=>{
    res.render('admin/products',{
      title: 'Products',
      products: products,
      count: count
    })
  })

})
router.get('/edit',(req,res)=>{
    res.redirect('/admin/product')
})
router.get('/edit/:id',(req,res)=>{

  Product.findById(req.params.id).then((err,page)=>{
    if(err){
      throw err;
    }
    Category.find().then((err,cats)=>{
      res.render('admin/editproduct',{
        title : 'Edit Product',
        name: page.name,
        slug : page.slug,
        price: page.price,
        description: page.description,
        id: page._id,
        categories: cats
      });
    })
  })
})

router.post('/edit',(req,res)=>{
  req.checkBody('name','Product name can\'t be empty').notEmpty();
  req.checkBody('categories','Categories can\'t be empty').notEmpty();
  req.checkBody('description','Description can\'t be empty').notEmpty();
  var slug=req.body.slug ,id = req.body.id;
  var name=req.body.name;
  var price = req.body.price;
  var description = req.body.description;
  var categories = req.body.categories;
  if(slug === "" ){
    slug = name;
  }
  slug = slug.replace(/\s+/g,'-').toLowerCase();
  var errors = req.validationErrors();

  if(errors){
    console.log(errors)
    Category.find().then((err,cats)=>{
      res.render('admin/editproduct',{
        errors: errors,
        title : 'Edit Product',
        name: name,
        slug : slug,
        price: price,
        description: description,
        id: id,
        categories: cats
      });
    })
  }
  else{
    Product.findOne().then({slug:slug, _id:{'$ne':id}},(err,page)=>{
      if(page){
        req.flash('danger',`Another category exists with slug as ${slug}`)
        console.log('Same slug exists')
        Category.find().then((err,cats)=>{
          res.render('admin/editproduct',{
            title : 'Edit Product',
            name: name,
            slug : slug,
            price: price,
            description: description,
            id: id,
            categories: cats
          });
        })
      }
      else{
        Product.findById(id).then((err,page)=>{
          if(err) throw err;
          if(!page){
            console.log('Product doesn\'t exist, Contact Developer!');
            res.send("404!")
          }
          else{
            console.log('Edit in progress')
            page.name = name;
            page.slug = slug;
            page.price = price;
            page.description = description;
            page.categories = categories;
            page.save().then((err) => {
              if (err) throw err;
              req.flash('success',`Category ${page.cattitle} edited successfully`);
              res.redirect('/admin/product');
            })
          }
        })
      }
    })
  }
})


router.get('/delete/:id',(req,res)=>{
  Product.findByIdAndDelete(req.params.id).then((err,page)=>{
    if(err) throw err;
    console.log('Deleted successfully')
    req.flash('success','Product deleted successfully');
    res.redirect('/admin/product/');
  })
})

router.get('/add',(req,res)=>{
  var name="",slug="",price=0,description="",image="";
  Category.find().then(
    (err,cats)=>{
    res.render('admin/addproduct',{
      title : 'Add Product',
      name: name,
      slug : slug,
      price: price,
      description: description,
      image: image,
      categories: cats
    });
  })
})

router.post('/add',(req,res)=>{
  req.checkBody('name','Product Name can\'t be empty').notEmpty();
  req.checkBody('description','Product Description can\'t be empty').notEmpty();
  req.checkBody('categories','Choose atleast one category or add one').notEmpty();
  var slug=req.body.slug;
  var name=req.body.name;
  if(slug === "" ){
    slug = name;
  }
  slug=slug.replace(/\s+/g,'-').toLowerCase();
  var price = req.body.price;
  var description = req.body.description;
  var categories = req.body.categories;
  // var imagename = req.body.image;
  var errors = req.validationErrors();

  if(errors){
    console.log(errors);
    Category.find((err,cats)=>{
      res.render('admin/addproduct',{
        errors: errors,
        title : 'Add Product',
        name: name,
        slug: slug,
        categories: cats,
        description: description,
        price: price
      })
    })
  }
  else{
    Product.findOne(({slug : slug}),(err,page)=>{
      if(page){
        console.log('Product with given slug already exists');
        req.flash('danger',`Product ${slug} already exists`);
        Category.find((err,cats)=>{
          res.render('admin/addproduct',{
            title : 'Add Product',
            name: name,
            slug: slug,
            categories: cats,
            description: description,
            price: price
          })
        })
      }
      else{
        var price2 = parseFloat(price).toFixed(2);
        console.log('Creating new product!')
        var newpage = new Product({
          name: name,
          slug: slug,
          description: description,
          price: price,
          // image: imageFile,
          categories: categories
        });
        newpage.save((err)=>{
          if (err) throw err;

          // mkdirp('public/product_images/'+newpage._id,(err)=>{
          //   throw err;
          //   console.log(err);
          // })
          // mkdirp('public/product_images/'+newpage._id+'/gallery',(err)=>{
          //   throw err;
          //   console.log(err);
          // })
          // mkdirp('public/product_images/'+newpage._id+'/gallery/thumbnail',(err)=>{
          //   throw err;
          //   console.log(err);
          // })
          // if(imageFile != ''){
          //   var productImage = req.files.image;
          //   var path = 'public/product_images/'+newpage._id+'/'+imageFile;
          //
          //   productImage.mv(path,(err)=>{
          //     throw err;
          //   })
          //
          // }
          req.flash('success','Product added!');
          res.redirect('/admin/product');
        })
      }
    })
  }
})


module.exports = router;
