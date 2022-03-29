const express = require('express');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { protect } = require('../middlewears/auth');
const router = express.Router();

router.route('/')
/***
 * Get a User
 * GET '/api/auth'
 * Auth required
*/
.get(protect, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.status(200).json(user);
})
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

  const tokens = generateTokens(user);
  if (user && tokens) {
    res.status(201).json(tokens);
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
.put(protect, async (req, res) => {
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
})
/***
 * Delete a User
 * DELETE '/api/auth'
 * Auth required
*/
.delete(protect, async (req, res) => {
  await req.user.remove();
  res.status(200).end();
});

router.post('/get-token', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400);
    throw new Error('please add all fields');
  }

  const user = await User.findOne({ username });
  if (!user || !(await bcrypt.compares(password, user.password))) {
    res.status(400);
    throw new Error('invalid cradencials');
  }

  const tokens = generateTokens(user);
  user.lastlogin = Date.now();
  user.save();
  res.status(200).json(tokens);
});

router.post('/refresh-token', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(400);
    throw new Error('token not provoded');
  }

  const { id, type } = jwt.verify(refreshToken, process.env.SECRET_KEY);
  const user = await User.findById(id);
  if (!id || type !== 'refresh' || !user) {
    res.status(400);
    throw new Error('invalid token');
  }

  const tokens = generateTokens(user);
  res.status(200).json(tokens);

});

const generateTokens = (user) => {
  const { id, username } = user;
  const tokens = {
    access: jwt.sign({ id, username, type: 'access' }, { expiresIn: '15d' }),
    refresh: jwt.sign({ id, username, type: 'refresh' }, { expiresIn: '90d' }),
  };
  return tokens;
};

module.exports = router;
