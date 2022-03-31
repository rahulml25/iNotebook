const errorHandler = (err, req, res, next) => {

  const statusCode = res?.statusCode || 500;
  let context = {
    message: err.message,
  }

  if (process.env.NODE_ENV !== 'production') {
    context['stack'] = err.stack;
  } else if (statusCode === 500) {
    context.message = 'internal server error';
  }

  res.status(statusCode);
  res.json(context);
};

module.exports = {
  errorHandler,
};
