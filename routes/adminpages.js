const express = require('express');
const router = express.Router();

var Page = require('../models/page');

// Pages HOME
router.get('/',(req,res)=>{
  Page.find({}).sort({sorting: 1}).exec((err,pages)=>{
    res.render('admin/pages',{
      title: 'List of Pages',
      pages: pages
    })
  })

})
router.get('/editpage/:slug',(req,res)=>{
  Page.findOne({slug: req.params.slug},(err,page)=>{
    if(err){
      console.log(err);
    }
    res.render('admin/editpage',{
      title : 'Edit Page',
      pagetitle : page.pagetitle,
      slug : page.slug,
      content : page.content,
      id: page._id
    })
  })
})

router.post('/posteditPage',(req,res)=>{
  req.checkBody('pagetitle','Title can\'t be empty').notEmpty();
  req.checkBody('content','Content can\'t be empty').notEmpty();
  var slug,id = req.body.id;
  var pagetitle=req.body.pagetitle;
  content=req.body.content;
  slug=req.body.slug;
  if(slug === "" ){
    slug = pagetitle;
  }
  slug=slug.replace(/\s+/g,'-').toLowerCase();
  var errors = req.validationErrors();

  if(errors){
    console.log(errors)
    Page.findById(id,(err,page)=>{
      if(err) throw err;
      res.render('admin/editpage',{
        errors: errors,
        title : 'Add Page',
        pagetitle : pagetitle,
        slug  : page.slug,
        content: content,
        id: id
      })
    })

  }
  else{
    Page.findOne({slug:slug, _id:{'$ne':id}},(err,page)=>{
      if(page){
        req.flash('danger',`Another page exists with slug as ${slug}`)
        console.log('Same slug exists')
        res.render('admin/editpage',{
          title : 'Add Page',
          pagetitle : pagetitle,
          slug  : slug,
          content: content,
          id: id
        })
      }
      else{
        Page.findById(id,(err,page)=>{
          if(err) throw err;
          if(!page){
            console.log('Page doesn\'t existed, Contact Developer!');
            res.render('admin/editpage',{
              title : 'Add Page',
              pagetitle : pagetitle,
              slug  : slug,
              content: content,
              id: id
            })
          }
          else{
            console.log('Edit in progress')
            page.pagetitle = pagetitle;
            page.slug = slug;
            page.content = content;
            page.save( (err) => {
              if (err) throw err;
              req.flash('success',`Page ${page.pagetitle} edited successfully`);
              res.redirect('/admin/pages/');
            })
          }
        })
      }
    })
  }
})


router.get('/deletepage/:id',(req,res)=>{
  Page.findByIdAndDelete(req.params.id,(err,page)=>{
    if(err) throw err;
    req.flash('success','Page deleted successfully');
    res.redirect('/admin/pages');
  })
})

router.get('/addPage',(req,res)=>{
  var pagetitle="",slug="",content="";
  res.render('admin/addpage',{
    title : 'Add Page',
    pagetitle : pagetitle,
    slug : slug,
    content : content
  });
})

router.post('/addPage',(req,res)=>{
  req.checkBody('pagetitle','Title can\'t be empty').notEmpty();
  req.checkBody('content','Content can\'t be empty').notEmpty();
  var slug=req.body.slug;
  var pagetitle=req.body.pagetitle;
  content=req.body.content;
  if(slug === "" ){
    slug = pagetitle;
  }
  slug=slug.replace(/\s+/g,'-').toLowerCase();
  var errors = req.validationErrors();
  if(errors){
    console.log(errors)
    res.render('admin/addpage',{
      errors: errors,
      title : 'Add Page',
      pagetitle : pagetitle,
      slug  : slug,
      content: content
    })
  }
  else{
    Page.findOne(({slug : slug}),(err,page)=>{
      if(page){
        console.log('Page existed');
        req.flash('danger',`Page ${slug} already exists`);
        res.render('admin/addpage',{
          title : 'Add Page',
          pagetitle : pagetitle,
          slug  : slug,
          content: content
        })
      }
      else{
        console.log('Creating new one!')
        var newpage = new Page({
          pagetitle: pagetitle,
          slug: slug,
          content: content,
          sorting: 0 // Sorting automatically set to 0
        });
        newpage.save((err)=>{
          if (err) throw err;
          req.flash('success','Page added!');
          res.redirect('/admin/pages');
        })
      }
    })
  }
})


module.exports = router;
