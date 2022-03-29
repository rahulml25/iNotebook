const errorHandler = (err, req, res, next) => {

  const statusCode = res?.statusCode || 500;
  let context = {
    message: err.message,
  }

  if (process.env.NODE_ENV !== 'production') {
    context['stack'] = err.stack;
  }

  res.status(statusCode);
  res.json(context);
};

module.exports = {
  errorHandler,
};
