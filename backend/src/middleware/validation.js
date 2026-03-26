const { validationResult } = require('express-validator');

/**
 * validation.js
 * -----------------------
 * Middleware for validating incoming request data using express-validator. 
 * Checks for validation errors and returns formatted error responses.
 * 
 *
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    
    console.log('Validation Error:', JSON.stringify(errors.array(), null, 2));

    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = validate;