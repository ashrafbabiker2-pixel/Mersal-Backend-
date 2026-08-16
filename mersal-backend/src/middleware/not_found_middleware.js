const notFoundMiddleware = (req, res) => {
  res.status(404).json({
    success: false,
    message: 'المسار المطلوب غير موجود',
    path: req.originalUrl,
    method: req.method
  });
};

module.exports = notFoundMiddleware;
