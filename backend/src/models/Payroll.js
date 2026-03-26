const mongoose = require("mongoose");

/**
 * Payroll Model
 * -----------------------
 * Represents a payroll record for a user, including time entries, pay calculations, 
 * adjustments, and payment status.
 */
/* =========================
   ADJUSTMENT SCHEMA
========================= */

const adjustmentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["bonus", "penalty"],
    required: true,
  },

  title: {
    type: String,
    required: true,
  },

  reason: {
    type: String,
  },

  amount: {
    type: Number,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/* =========================
   PAYROLL SCHEMA
========================= */

const payrollSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    entries: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TimeEntry",
      },
    ],

    totalHours: {
      type: Number,
      required: true,
    },

    payRate: {
      type: Number,
      default: 0,
    },

    /* =========================
       ORIGINAL CALCULATED PAY
    ========================= */

    basePay: {
      type: Number,
      required: true,
    },

    /* =========================
       FINAL PAY (AFTER ADJUSTMENTS)
    ========================= */

    totalPay: {
      type: Number,
      required: true,
    },

    /* =========================
       ADMIN ADJUSTMENTS
    ========================= */

    adjustments: [adjustmentSchema],

    periodStart: Date,

    periodEnd: Date,

    /* =========================
       PAYMENT STATUS
    ========================= */

    status: {
      type: String,
      enum: ["unpaid", "paid"],
      default: "unpaid",
    },

    paidAt: {
      type: Date,
    },
  },

  { timestamps: true }
);

/* =========================
   RECALCULATE FINAL PAY
========================= */

payrollSchema.methods.calculateFinalPay = function () {
  let adjustmentTotal = 0;

  this.adjustments.forEach((adj) => {
    if (adj.type === "bonus") {
      adjustmentTotal += adj.amount;
    }

    if (adj.type === "penalty") {
      adjustmentTotal -= adj.amount;
    }
  });

  this.totalPay = this.basePay + adjustmentTotal;
};

module.exports = mongoose.model("Payroll", payrollSchema);