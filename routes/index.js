const express = require('express');
const router = express.Router();



router.get('/',(req,res) => {
  Page.findOne({slug:'home'},(err,page)=>{
    if(err) throw err;
    if(!page){
      req.flash('danger','Requested Page doesn\'t exist');
      res.redirect('/');
    }
    else{
      res.render('pages',{
        title : page.pagetitle,
        content : page.content
      })
    }
  })
})

router.get('/nav/:slug',(req,res) => {
  Page.findOne({slug:req.params.slug},(err,page)=>{
    if(err) throw err;
    if(!page){
      req.flash('danger','Requested Page doesn\'t exist');
      res.redirect('/');
    }
    else{
      res.render('pages',{
        title : page.pagetitle,
        content : page.content
      })
    }
  })
})

module.exports = router;
