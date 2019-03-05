var mongoose = require('mongoose');
// Product Schema
const ProductSchema = mongoose.Schema({
  name: {
    type: String,
    required : true
  },
  slug: {
    type: String
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required : true
  },
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  image: {
    type: String,
    required: true
  }
});

var Product = module.exports = mongoose.model('Product',ProductSchema);
