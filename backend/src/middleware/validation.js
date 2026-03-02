const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    
    console.log('❌ Validation Error:', JSON.stringify(errors.array(), null, 2));

    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = validate;