// -----------Admin Schema--------------
const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');
mongoose.connect("mongodb://127.0.0.1:27017/studentDB");

const userschema = mongoose.Schema({
  username: {
    type: String,
    require: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    require: true,
    trim: true
  },
  adminKey: String,
  date: {
    type: Date,
    default: Date.now
  }
})

userschema.plugin(plm);
module.exports = mongoose.model('admin', userschema);