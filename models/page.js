var mongoose = require('mongoose');


// Page Schema
const PageSchema = mongoose.Schema({
  pagetitle: {
    type: String,
    required : true
  },

  slug: {
    type: String
  },
  content: {
    type: String,
    required: true
  },
  sorting: {
    type: Number
  }
});

var Page = module.exports = mongoose.model('Page',PageSchema);
