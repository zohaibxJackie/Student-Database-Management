const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/studentDB');

const studentschema = mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  rollNumber: {
    type: Number,
    unique: true,
    trim: true
  },
  image: {
    type: String
    // require: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('students', studentschema);
