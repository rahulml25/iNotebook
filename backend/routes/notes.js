const express = require('express');
const { Note } = require('../models');
const { protect } = require('../middlewears/auth');

const router = express.Router();

router.route('/')
/***
 * Get all Notes
 * GET '/api/notes'
 * Auth required
*/
.get(protect, async (req, res) => {
  let secure_notes = [];
  const notes = await Note.find({ user: req.user.id }, {
    _id: 0, __v: 0,
    user: 0,
  });

  for (const note of notes) {
    const secure_note = {
      id: note.id,
      ...(note),
    };
    secure_notes.push(secure_note);
  }

  res.status(200).json(secure_notes);
})
/***
 * Create a new Note
 * POST '/api/notes'
 * Auth required
*/
.post(protect, async (req, res) => {
  const { title, description, tag } = req.body;

  if (!title || !description) {
    res.status(400);
    throw new Error('please add all fields');
  }

  let note = await Note.create({
    user: req.user.id,
    title,
    description,
  });

  if (tag) {
    note.tag = tag;
    note.save();
  }

  note = await Note.findById(note.id, {
    _id: 0, __v: 0,
    user: 0,
  });
  req.status(200).json(note);
});

router.route('/:id')
/***
 * Update a Note
 * PUT '/api/notes/:id'
 * Auth required
*/
.put(protect, async (req, res) => {
  const { id } = req.query;

  let note = await Note.findById(id).select('-__v');
  if (!note || note.user !== req.user.id) {
    res.status(404);
    throw new error("note does't exists");
  }

  try {
    note.update(req.body);
    note = await Note.findById(id, {
      _id: 0, __v: 0,
      user: 0,
    });
  } catch (error) {
    console.error(error);
    res.status(422);
    throw new Error('invalid request data');
  }

  res.status(200).json({
    id: note.id,
    ...(note._doc),
  });
})
/***
 * Delete a Note
 * DELETE '/api/notes/:id'
 * Auth required
*/
.delete(protect, async (req, res) => {
  const { id } = req.query;

  const note = await Note.findById(id);
  if (!note || note.user !== req.user) {
    res.status(404);
    throw new Error("note doesn't exists");
  }

  note.remove();
  res.status(200).end();
});

module.exports = router;
