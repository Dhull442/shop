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
  Product.countDocuments((err,c)=>{
    count = c
  });
  Product.find((err,products)=>{
    res.render('admin/products',{
      title: 'Products',
      products: products,
      count: count
    })
  })

})
router.get('/edit/:slug',(req,res)=>{
  Category.findOne({slug: req.params.slug},(err,page)=>{
    if(err){
      console.log(err);
    }
    res.render('admin/editCat',{
      title : 'Edit Category',
      cattitle : page.cattitle,
      slug : page.slug,
      id: page._id
    })
  })
})

router.post('/postedit',(req,res)=>{
  req.checkBody('cattitle','Title can\'t be empty').notEmpty();
  // req.checkBody('content','Content can\'t be empty').notEmpty();
  var slug=req.body.slug ,id = req.body.id;
  var cattitle=req.body.cattitle;
  if(slug === "" ){
    slug = cattitle;
  }
  slug = slug.replace(/\s+/g,'-').toLowerCase();
  var errors = req.validationErrors();

  if(errors){
    console.log(errors)
    res.render('admin/editCat',{
      errors: errors,
      title : 'Edit Category',
      cattitle : cattitle,
      slug  : slug,
      // content: content,
      id: id
    })
  }
  else{
    Category.findOne({slug:slug, _id:{'$ne':id}},(err,page)=>{
      if(page){
        req.flash('danger',`Another category exists with slug as ${slug}`)
        console.log('Same slug exists')
        res.render('admin/editCat',{
          title : 'Edit Category',
          cattitle : cattitle,
          slug  : slug,
          // content: content,
          id: id
        })
      }
      else{
        Category.findById(id,(err,page)=>{
          if(err) throw err;
          if(!page){
            console.log('Category doesn\'t exist, Contact Developer!');
            res.render('admin/editCat',{
              title : 'Add Category',
              cattitle : cattitle,
              slug  : slug,
              // content: content,
              id: id
            })
          }
          else{
            console.log('Edit in progress')
            page.cattitle = cattitle;
            page.slug = slug;
            // page.content = content;
            page.save( (err) => {
              if (err) throw err;
              req.flash('success',`Category ${page.cattitle} edited successfully`);
              res.redirect('/admin/category');
            })
          }
        })
      }
    })
  }
})


router.get('/delete/:id',(req,res)=>{
  Category.findByIdAndRemove(req.params.id,(err,page)=>{
    if(err) throw err;
    req.flash('success','Category deleted successfully');
    res.redirect('/admin/category');
  })
})

router.get('/add',(req,res)=>{
  var name="",slug="",price=0,description="",image="";
  Category.find((err,cats)=>{
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
  console.log(req.files);
  var imageFile = typeof req.files.image != 'undefined' ? req.files.image.name : '';
  req.checkBody('image','You must upload an image').isImage(imageFile);
  var slug=req.body.slug;
  var name=req.body.name;
  if(slug === "" ){
    slug = name;
  }
  slug=slug.replace(/\s+/g,'-').toLowerCase();
  var price = req.body.price;
  var description = req.body.description;
  var categoriesid = req.body.categories;
  var imagename = req.body.image;
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
        price: price,
        image: imagename
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
            price: price,
            image: imagename
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
          image: imageFile,
          categories: categories
        });
        newpage.save((err)=>{
          if (err) throw err;

          mkdirp('public/product_images/'+newpage._id,(err)=>{
            throw err;
            console.log(err);
          })
          mkdirp('public/product_images/'+newpage._id+'/gallery',(err)=>{
            throw err;
            console.log(err);
          })
          mkdirp('public/product_images/'+newpage._id+'/gallery/thumbnail',(err)=>{
            throw err;
            console.log(err);
          })
          if(imageFile != ''){
            var productImage = req.files.image;
            var path = 'public/product_images/'+newpage._id+'/'+imageFile;

            productImage.mv(path,(err)=>{
              throw err;
            })

          }
          req.flash('success','Product added!');
          res.redirect('/admin/product');
        })
      }
    })
  }
})


module.exports = router;
