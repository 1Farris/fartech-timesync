const User = require("../models/User");

const checkSubscription = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    /* ===============================
       1️⃣ ACTIVE STRIPE SUBSCRIPTION
    =============================== */
    if (user.subscriptionStatus === "active") {
      return next();
    }

    /* ===============================
       2️⃣ TRIAL LOGIC
    =============================== */
    if (user.subscriptionStatus === "trial") {
      if (user.subscriptionCurrentPeriodEnd &&
          new Date() < user.subscriptionCurrentPeriodEnd) {
        return next();
      }

      return res.status(403).json({
        error: "Trial expired. Please upgrade to continue.",
        code: "TRIAL_EXPIRED"
      });
    }

    /* ===============================
       3️⃣ CANCELED / PAST DUE / UNPAID
    =============================== */
    return res.status(403).json({
      error: "Subscription inactive. Please renew to continue.",
      code: "SUBSCRIPTION_REQUIRED"
    });

  } catch (error) {
    console.error("Subscription middleware error:", error);
    res.status(500).json({ error: "Subscription validation failed" });
  }
};

module.exports = checkSubscription;