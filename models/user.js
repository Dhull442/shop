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
  }
})


var User = module.exports = mongoose.model('User',UserSchema);
