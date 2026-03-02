const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    firstName: {
      type: String,
      required: true,
    },

    lastName: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["worker", "team-leader", "admin"],
      default: "worker",
    },

    payRate: {
      type: Number,
      default: 15,
    },

    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      default: null,
    },

    /* =====================================
       SUBSCRIPTION SYSTEM (STRIPE READY)
    ===================================== */

    subscriptionStatus: {
      type: String,
      enum: ["trial", "active", "canceled", "past_due", "unpaid"],
      default: "trial",
    },

    subscriptionCurrentPeriodEnd: {
      type: Date,
      default: () =>
        new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days trial
    },

    stripeCustomerId: {
      type: String,
      default: null,
    },

    stripeSubscriptionId: {
      type: String,
      default: null,
    },

    /* ===================================== */

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);