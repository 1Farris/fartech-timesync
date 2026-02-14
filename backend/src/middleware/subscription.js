const checkSubscription = async (req, res, next) => {
  const user = req.user;

  // Check if trial has expired
  if (user.subscription.plan === 'trial') {
    if (new Date() > user.subscription.trialEndsAt) {
      return res.status(403).json({ 
        error: 'Trial expired. Please upgrade to continue.',
        upgradeUrl: '/subscription/upgrade'
      });
    }
  }

  // Check if subscription is active
  if (user.subscription.status !== 'active') {
    return res.status(403).json({ 
      error: 'Subscription inactive. Please renew to continue.',
      renewUrl: '/subscription/renew'
    });
  }

  next();
};

module.exports = checkSubscription;