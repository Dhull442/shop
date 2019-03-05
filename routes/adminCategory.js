const express = require('express');
const router = express.Router();

var Category = require('../models/category');

router.get('/',(req,res)=>{
  Category.find((err,category)=>{
    res.render('admin/categories',{
      title: 'List of Shopping Categories',
      categories : category
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
  var cattitle="",slug="";
  res.render('admin/addCat',{
    title : 'Add Category',
    cattitle : cattitle,
    slug : slug
  });
})

router.post('/add',(req,res)=>{
  req.checkBody('cattitle','Category Name can\'t be empty').notEmpty();
  var slug=req.body.slug;
  var cattitle=req.body.cattitle;
  if(slug === "" ){
    slug = cattitle;
  }
  slug=slug.replace(/\s+/g,'-').toLowerCase();
  var errors = req.validationErrors();

  if(errors){
    console.log(errors)
    res.render('admin/addCat',{
      errors: errors,
      title : 'Add category',
      cattitle : cattitle,
      slug  : slug
    })
  }
  else{
    Category.findOne(({slug : slug}),(err,page)=>{
      if(page){
        console.log('Category existed');
        req.flash('danger',`Category ${slug} already exists`);
        res.render('admin/addCat',{
          title : 'Add Category',
          cattitle : cattitle,
          slug  : slug
        })
      }
      else{
        console.log('Creating new one!')
        var newpage = new Category({
          cattitle: cattitle,
          slug: slug,
        });
        newpage.save((err)=>{
          if (err) throw err;
          req.flash('success','Category added!');
          res.redirect('/admin/category');
        })
      }
    })
  }
})


module.exports = router;
