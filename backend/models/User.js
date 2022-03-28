const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    lowercase: true,
    reqiured: true,
  },
  name: {
    type: String,
    reuired: true,
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    reqiured: true,
  },
  password: {
    type: String,
    required: true,
  },
  lastlogin: {
    type: Date,
    default: Date.now,
  }
}, { timestamp: true });

module.exports = (
  mongoose.models.User
  || mongoose.model('User', UserSchema)
);
