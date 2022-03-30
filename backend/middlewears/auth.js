const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const { User } = require('../models');

const protect = asyncHandler(async (req, res, next) => {
  let token;
  const { authorization } = req.headers;

  if (
    authorization &&
    authorization.startsWith('Bearer')
  ) {

    try {
      token = authorization.split('Bearer+')[1];

      const { type, id } = jwt.verify(token, process.env.SECRET_KEY);
      if (type !== 'access') throw new Error();

      const user = await User.findById(id);
      if (!user) throw new Error();

      req.user = user;
      next();

    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('unauthorized');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('unauthorized');
  }
});

module.exports = {
  protect,
};
