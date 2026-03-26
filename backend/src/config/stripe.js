const Stripe = require("stripe");
/* ======================================================
   STRIPE INITIALIZATION
====================================================== */
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/* ======================================================
   EXPORTS
====================================================== */
module.exports = stripe;