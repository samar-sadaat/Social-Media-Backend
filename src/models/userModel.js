const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  age: {
    type: Number,
    required: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  profileUrls: {
    thumbnail: String,
    small: String,
    medium: String,
    large: String,
  },
  profileType: {
    type: String,
    enum: ['image'],
    default: 'image'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});
module.exports = mongoose.model('User', UserSchema);