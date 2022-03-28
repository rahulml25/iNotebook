const jwt = require('jsonwebtoken');

const handleAuth = (requestHandler) => async (req, res) => {
  const { authorization } = req.headers;

  try {
    const token = String(authorization).split(' ');
    const { type, id } = jwt.verify(token, process.env.SECRET_KEY);
    if (type !== 'access') throw new Error();
    const user = await User.findById(id);
    if (!user) throw new Error();
    req['user'] = user;
  } catch (error) {
    console.error(error);
    res.status(401);
    throw new Error('unauthorized');
  }

  return await requestHandel(req, res);
};

module.exports = {
  handleAuth,
};
