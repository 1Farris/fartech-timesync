const User = require("../models/User");

/**
 * Subscription Middleware
 * -----------------------
 * Validates user subscription status before allowing access to protected routes. 
 * Checks for active Stripe subscription or valid trial period.
 */
const checkSubscription = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    /* ===============================
       ACTIVE STRIPE SUBSCRIPTION
    =============================== */
    if (user.subscriptionStatus === "active") {
      return next();
    }

    /* ===============================
       TRIAL LOGIC
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
       CANCELED / PAST DUE / UNPAID
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