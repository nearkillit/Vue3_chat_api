function logErrors(err, req, res, next) {
  console.error(err.stack);
  next(err);
}

function errorHandler(err, req, res, next) {
  res.status(err.statusCode || 500);
  res.send({ error: err });
}

class CustomError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

app.use(logErrors);
app.use(errorHandler);
