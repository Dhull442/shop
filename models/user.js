const mongoose = require('mongoose')

const UserSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  admin:{
    type: Number
  },
  password: {
    type: String,
    required: true
  },
  about: {
    type: String
  },
  address: [{
    type: String
  }]
})


var User = module.exports = mongoose.model('User',UserSchema);
