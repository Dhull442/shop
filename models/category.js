var mongoose = require('mongoose');


// Category Schema
const CategorySchema = mongoose.Schema({
  cattitle: {
    type: String,
    required : true
  },
  slug: {
    type: String
  }
});

var Category = module.exports = mongoose.model('Category',CategorySchema);
