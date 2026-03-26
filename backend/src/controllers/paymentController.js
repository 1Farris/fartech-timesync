const Payment = require('../models/Payment');
const TimeEntry = require('../models/TimeEntry');
const User = require('../models/User');
const PDFDocument = require('pdfkit');
const stripe = require("../config/stripe");

/**
 * Payment Controller
 * -----------------------
 * Handles payment calculations, Stripe integration, and PDF generation for payslips.  
 */

/* ======================================================
   CALCULATE PAYMENT
====================================================== */

exports.calculatePayment = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user._id;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Start and End date required" });
    }

    const user = await User.findById(userId);
    const payRate = user.payRate || 0;

    const timeEntries = await TimeEntry.find({
      status: "approved",
      weekStart: {
        $gte: new Date(startDate),
      },
      weekEnd: {
        $lte: new Date(endDate),
      },
      userId,
    });



    const totalHours = timeEntries.reduce((sum, entry) => {
      return sum + entry.totalHours;
    }, 0);

    const regularHours = Math.min(totalHours, 40);
    const overtimeHours = Math.max(totalHours - 40, 0);

    const regularPay = regularHours * payRate;
    const overtimePay = overtimeHours * payRate * 1.5;
    const bonus = 0;
    const totalPay = regularPay + overtimePay + bonus;

    const payment = await Payment.create({
      userId,
      payPeriodStart: new Date(startDate),
      payPeriodEnd: new Date(endDate),
      regularHours,
      overtimeHours,
      regularPay,
      overtimePay,
      bonus,
      totalPay,
      timeEntries: timeEntries.map((entry) => entry._id),
    });

    res.json({
      success: true,
      payment,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ======================================================
   GET PAYMENTS
====================================================== */

exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id })
      .sort({ payPeriodEnd: -1 })
      .populate("timeEntries");

    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ======================================================
   CREATE STRIPE CHECKOUT SESSION
====================================================== */

exports.createCheckoutSession = async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: req.user.email,
      metadata: {
        userId: req.user._id.toString(),
      },
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/dashboard`,
      cancel_url: `${process.env.CLIENT_URL}/subscription`,
    });

    res.json({ url: session.url });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ======================================================
   STRIPE WEBHOOK (CRITICAL)
====================================================== */

exports.stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {

    /* ===============================
       CHECKOUT COMPLETED
    =============================== */
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata.userId;

      const subscription = await stripe.subscriptions.retrieve(
        session.subscription
      );

      await User.findByIdAndUpdate(userId, {
        stripeCustomerId: session.customer,
        stripeSubscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        subscriptionCurrentPeriodEnd: new Date(
          subscription.current_period_end * 1000
        ),
      });

      console.log("✅ Subscription activated");
    }

    /* ===============================
       SUBSCRIPTION UPDATED
    =============================== */
    if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object;

      await User.findOneAndUpdate(
        { stripeSubscriptionId: subscription.id },
        {
          subscriptionStatus: subscription.status,
          subscriptionCurrentPeriodEnd: new Date(
            subscription.current_period_end * 1000
          ),
        }
      );

      console.log("🔄 Subscription updated");
    }

    /* ===============================
       SUBSCRIPTION CANCELLED
    =============================== */
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;

      await User.findOneAndUpdate(
        { stripeSubscriptionId: subscription.id },
        {
          subscriptionStatus: "canceled",
          stripeSubscriptionId: null,
        }
      );

      console.log("❌ Subscription cancelled");
    }

    res.json({ received: true });

  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).send("Webhook failed");
  }
};

/* ======================================================
   CANCEL SUBSCRIPTION
====================================================== */

exports.cancelSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.stripeSubscriptionId) {
      return res.status(400).json({ error: "No active subscription found" });
    }

    await stripe.subscriptions.update(user.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    res.json({
      success: true,
      message: "Subscription will cancel at period end",
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ======================================================
   STRIPE CUSTOMER PORTAL
====================================================== */

exports.createCustomerPortal = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.stripeCustomerId) {
      return res.status(400).json({ error: "No Stripe customer found" });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.CLIENT_URL}/dashboard`,
    });

    res.json({ url: portalSession.url });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ======================================================
   GENERATE PAYMENT PDF
====================================================== */

exports.generatePaymentPDF = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user._id;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Start and End date required" });
    }

    const user = await User.findById(userId);
    const payRate = user.payRate || 0;

    const timeEntries = await TimeEntry.find({
      userId,
      status: "approved",
      weekStart: {
        $lte: new Date(startDate),
      },
      weekEnd: {
        $gte: new Date(endDate),
      },
    }).sort({ date: 1 });

    const doc = new PDFDocument({ margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=payslip-${startDate}-${endDate}.pdf`
    );

    doc.pipe(res);

    doc.fontSize(22).text("FarTech TimeSync", { align: "center" });
    doc.moveDown();
    doc.fontSize(16).text("Official Payslip", { align: "center" });
    doc.moveDown(2);

    doc.fontSize(12);
    doc.text(`Employee: ${user.firstName} ${user.lastName}`);
    doc.text(`Email: ${user.email}`);
    doc.text(`Pay Rate: $${payRate}/hour`);
    doc.text(
      `Period: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`
    );
    doc.moveDown(2);

    let totalHours = 0;
    let totalPay = 0;

    timeEntries.forEach((entry) => {
      const hoursWorked = entry.totalHours;
      const pay = hoursWorked * payRate;

      totalHours += hoursWorked;
      totalPay += pay;

      doc.text(
        `${new Date(entry.weekStart).toLocaleDateString()} - ${new Date(entry.weekEnd).toLocaleDateString()} | ${entry.companyType} | ${hoursWorked.toFixed(2)} hrs | $${pay.toFixed(2)}`
      );
    
    });

    doc.moveDown(2);
    doc.fontSize(14).text(`Total Hours: ${totalHours.toFixed(2)} hrs`);
    doc.fontSize(14).text(`Total Payment: $${totalPay.toFixed(2)}`);

    doc.end();

  } catch (error) {
    res.status(500).json({ error: "Failed to generate PDF" });
  }
};