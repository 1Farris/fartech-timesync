const express = require('express');
const paymentController = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/calculate', authenticate, paymentController.calculatePayment);
router.get('/', authenticate, paymentController.getPayments);

module.exports = router;