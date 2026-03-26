const express = require("express");
const paymentController = require("../controllers/paymentController");
const { authenticate } = require("../middleware/auth");

/**
 * payments.js
 * -----------------------
 * Routes for handling payment-related operations, including payment calculation, Stripe 
 * webhook processing, and PDF generation.    
 */

const router = express.Router();

/* ================= STRIPE WEBHOOK (NO AUTH) ================= */
// DO NOT add authenticate here
// Raw body is configured in server.js
router.post(
  "/webhook",
  paymentController.stripeWebhook
);

/* ================= PAYMENT CALCULATION ================= */
router.get(
  "/calculate",
  authenticate,
  paymentController.calculatePayment
);

/* ================= GET PAYMENTS ================= */
router.get(
  "/",
  authenticate,
  paymentController.getPayments
);

/* ================= CREATE CHECKOUT SESSION ================= */
router.post(
  "/create-checkout-session",
  authenticate,
  paymentController.createCheckoutSession
);

/* ================= DOWNLOAD PAYMENT PDF ================= */
router.get(
  "/pdf",
  authenticate,
  paymentController.generatePaymentPDF
);

module.exports = router;