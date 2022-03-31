const express = require('express');
const asyncHandler = require('express-async-handler');
const {
  body: validate_body,
  validationResult: validation_result,
} = require('express-validator');
const { Note } = require('../models');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.route('/')
/***
 * Get all Notes
 * GET '/api/notes'
 * Auth required
*/
.get(protect, asyncHandler(async (req, res) => {
  let secure_notes = [];
  const notes = await Note.find({ user: req.user.id });

  for (const note of notes) {
    secure_notes.push({
      id: note._id,
      title: note.title,
      description: note.description,
      tag: note.tag,
    });
  }

  res.status(200).json(secure_notes);
}))
/***
 * Create a new Note
 * POST '/api/notes'
 * Auth required
*/
.post(protect, [
  validate_body('title').isLength({ min: 4 }),
  validate_body('description').isLength({ min: 5 }),
],
asyncHandler(async (req, res) => {
  const { title, description, tag } = req.body;

  if (!title || !description) {
    res.status(400);
    throw new Error('please add all fields');
  }

  const errors = validation_result(req);
  if (!errors.isEmpty()) {
    res.status(400);
    return res.json({ message: errors.array() });
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

  const id = note.id;
  note = await Note.findById(note.id, {
    _id: 0, __v: 0,
    user: 0,
  });
  res.status(200).json({
    id, ...(note._doc),
  });
}));

router.route('/:id')
/***
 * Update a Note
 * PUT '/api/notes/:id'
 * Auth required
*/
.put(protect, [
  validate_body('title').isLength({ min: 4 }),
  validate_body('description').isLength({ min: 5 }),
  validate_body('tag').isLength({ min: 3 }),
],
asyncHandler(async (req, res) => {
  const errors = validation_result(req);
  if (!errors.isEmpty()) {
    res.status(400);
    return res.json({ message: errors.array() });
  }

  const { id } = req.query;
  let note = await Note.findById(id);

  if (!note || note.user.toString() !== req.user.id) {
    res.status(404);
    throw new Error("note does't exists");
  }

  try {
    const { title, description, tag } = req.body;
    note.title = title,
    note.description = description,
    note.tag = tag;
    await note.save();
  } catch (error) {
    console.error(error);
    res.status(422);
    throw new Error('invalid request data');
  }

  res.status(200).json({
    id: note._id,
    title: note.title,
    description: note.description,
    tag: note.tag,
  });
}))
/***
 * Delete a Note
 * DELETE '/api/notes/:id'
 * Auth required
*/
.delete(protect, asyncHandler(async (req, res) => {
  const { id } = req.query;

  const note = await Note.findById(id);
  if (!note || note.user.toString() !== req.user.id) {
    res.status(404);
    throw new Error("note doesn't exists");
  }

  note.remove();
  res.status(200).end();
}));

module.exports = router;
