const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const {
  body: validate_body,
  validationResult: validation_result
} = require('express-validator');
const { User } = require('../models');
const { protect } = require('../middlewears/auth');
const router = express.Router();

router.route('/')
/***
 * Get authorized User data
 * GET '/api/auth'
 * Auth required
*/
.get(protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id, {
    _id: 0, __v: 0,
    password: 0,
    lastlogin: 0,
  });
  res.status(200).json(user);
}))
/***
 * Create a new User
 * POST '/api/auth'
 * Auth doesn't require
*/
.post([
  validate_body('username').isLength({ min: 3 }),
  validate_body('name').isLength({ min: 5 }),
  validate_body('email').isEmail(),
  validate_body('password').isLength({ min: 6 }),
],
asyncHandler(async (req, res) => {
  const { username, name, email, password } = req.body;

  if (!username || !name || !email || !password) {
    res.status(400);
    throw new Error('include all fields');
  }

  const errors = validation_result(req);
  if (!errors.isEmpty()) {
    res.status(400);
    return res.json({ message: errors.array() });
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
    throw new Error('invalid credencials');
  }

}))
/***
 * Update authorized User data
 * PUT '/api/auth'
 * Auth required
*/
.put(protect, asyncHandler(async (req, res) => {
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
 * Delete authorized User account
 * DELETE '/api/auth'
 * Auth required
*/
.delete(protect, asyncHandler(async (req, res) => {
  req.user.remove();
  res.status(200).end();
}));

/***
 * Get Authorized
 * POST '/api/autj/get'
 * Credencials required
*/
router.post('/get', [
  validate_body('username').isLength({ min: 3 }),
  validate_body('password').isLength({ min: 6 }),
],
asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400);
    throw new Error('please add all fields');
  }

  const errors = validation_result(req);
  if (!errors.isEmpty()) {
    res.status(400);
    return res.json({ message: errors.array() });
  }

  const user = await User.findOne({ username });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(400);
    throw new Error('invalid credencials');
  }

  const tokens = generateTokens(user);
  user.lastlogin = Date.now();
  user.save();
  res.status(200).json(tokens);
}));

/***
 * Renew Authorization
 * POST '/api/auth/refresh'
 * Auth refresher required
*/
router.post('/refresh',
validate_body('refreshToken').isLength({ min: 15 }),
asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(400);
    throw new Error('token not provoded');
  }

  const errors = validation_result(req);
  if (!errors.isEmpty()) {
    res.status(400);
    return res.json({ message: errors.array() });
  }

  const { id, type } = jwt.verify(refreshToken, process.env.SECRET_KEY);
  const user = await User.findById(id);
  if (!id || type !== 'refresh' || !user) {
    res.status(400);
    throw new Error('invalid token');
  }

  const tokens = generateTokens(user);
  res.status(200).json(tokens);

}));

const generateTokens = (user) => {
  const { id, username } = user;
  const tokens = {
    access: jwt.sign({ id, username, type: 'access' }, process.env.SECRET_KEY, { expiresIn: '15d' }),
    refresh: jwt.sign({ id, username, type: 'refresh' }, process.env.SECRET_KEY, { expiresIn: '90d' }),
  };
  return tokens;
};

module.exports = router;
