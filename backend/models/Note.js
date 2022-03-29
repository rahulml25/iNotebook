const mongoose = require('mongoose');
const User = require('./User');

const NoteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: User,
  },
  title: {
    type: String,
    reqiured: true,
  },
  description: {
    type: String,
    reuired: true,
  },
  tag: {
    type: String,
    default: 'General',
  }
}, { timestamp: true });

module.exports = (
  mongoose.models.Note
  || mongoose.model('Note', NoteSchema)
);
