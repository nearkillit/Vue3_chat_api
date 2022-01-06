// const { HttpException } = require("express");
// errorException.ts
class HttpException extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode || 500;
    this.message = message;
  }
}

const badRequestException = (message = "400 Bad Request") => {
  return new HttpException(400, message);
};

const forbiddenException = (message = "403 Forbidden") => {
  return new HttpException(403, message);
};

// Error Handler Middleware
function errorHandler(err, req, res) {
  res.status(err.statusCode || 500).send(err.message);
}

module.exports = errorHandler;
exports.badRequestException = badRequestException;
exports.forbiddenException = forbiddenException;
