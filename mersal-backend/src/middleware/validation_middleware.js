const validateRequired = (fields = []) => {
  return (req, res, next) => {
    const missingFields = [];

    for (const field of fields) {
      const value = req.body[field];

      if (
        value === undefined ||
        value === null ||
        String(value).trim() === ''
      ) {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'هناك حقول مطلوبة غير مكتملة',
        fields: missingFields
      });
    }

    next();
  };
};

module.exports = {
  validateRequired
};
