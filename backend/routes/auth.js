const express = require('express');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { handleAuth } = require('../middlewears/auth');
const router = express.Router();

router.route('/')
/***
 * Get a User
 * GET '/api/auth'
 * Auth required
*/
.get(handleAuth(async (req, res) => {
  const user = await User.findById(req.user.id);
  res.status(200).json(user);
}))
/***
 * Create User
 * POST '/api/auth'
 * Auth doesn't require
*/
.post(async (req, res) => {
  const { username, name, email, password } = req.body;

  if (!username || !name || !email || !password) {
    res.status(400);
    throw new Error('include all fields');
  }

  const userExists = await User.findOne({ username, email });
  if (userExists) {
    res.status(400);
    throw new Error('user already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  let user = await User.create({
    username,
    name,
    email,
    password: hashedPassword
  });
  const id = user.id;
  user = await User.findById(id, {
    _id: 0, __v: 0,
    updatedAt: 0,
    password: 0,
    lastlogin: 0,
  });

  if (user) {
    res.status(201).json(user);
  } else {
    res.status(422);
    throw new Error('invalid cradencials');
  }

})
/***
 * Update a User
 * PUT '/api/auth'
 * Auth required
*/
.put(handleAuth(async (req, res) => {
  const id = req.user.id;
  const userUpdated = await User.findByIdAndUpdate(id, req.body);
  if (!userUpdated) {
    res.status(422);
    throw new Error('invalid user data');
  }
  const user = await User.findById(id, {
    _id: 0, __v: 0,
    updatedAt: 0,
    password: 0,
    lastlogin: 0,
  });
  res.status(200).json(user);
}))
/***
 * Delete a User
 * DELETE '/api/auth'
 * Auth required
*/
.delete(handleAuth((req, res) => {

}));

router.post('/get-token', (req, res) => {

});

router.post('/refresh-token', (req, res) => {

});

module.exports = router;
