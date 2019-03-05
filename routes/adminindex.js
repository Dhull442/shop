const express = require('express');
const router = express.Router();

router.get('/',(req,res) => {
  res.render('adminindex',{
    title:'admin Dashboard'
  })
})

module.exports = router;
