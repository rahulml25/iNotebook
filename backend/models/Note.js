const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
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
