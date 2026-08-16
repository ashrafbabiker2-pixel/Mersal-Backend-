const errorMiddleware = (error, req, res, next) => {
  console.error('========================================');
  console.error('MERSAL SERVER ERROR');
  console.error('========================================');
  console.error(error);
  console.error('========================================');

  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500
        ? 'حدث خطأ داخلي في الخادم'
        : error.message
  });
};

module.exports = errorMiddleware;
