const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validation');

/**
 * auth.js
 * -----------------------
 * Routes for user authentication and profile management.   
 * Includes registration, login, and profile retrieval endpoints.
 * // Note: Registration includes validation for email, password, and name fields.
 */


/* =========================
   ROUTES
========================= */
const router = express.Router();

router.post('/register', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').notEmpty(),
  body('lastName').notEmpty(),
  validate
], authController.register);

router.post('/login', authController.login);
router.get('/profile', authenticate, authController.getProfile);

module.exports = router;