const mongoose = require("mongoose");

const dailyHoursSchema = {
  monday: { type: Number, min: 0, max: 8, default: 0 },
  tuesday: { type: Number, min: 0, max: 8, default: 0 },
  wednesday: { type: Number, min: 0, max: 8, default: 0 },
  thursday: { type: Number, min: 0, max: 8, default: 0 },
  friday: { type: Number, min: 0, max: 8, default: 0 },
  saturday: { type: Number, min: 0, max: 8, default: 0 },
  sunday: { type: Number, min: 0, max: 8, default: 0 }
};

const timeEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    weekStart: {
      type: Date,
      required: true,
    },

    weekEnd: {
      type: Date,
      required: true,
    },

    companyType: {
      type: String,
      enum: ["RWS", "Welocalized", "Telus"],
      required: true,
    },

    /* ================= RWS ================= */
    weeklyTotalHours: {
      type: Number,
      min: 0,
    },

    /* ========== Welocalized / Telus ========= */
    dailyHours: dailyHoursSchema,

    /* ========== Auto-calculated Total ========= */
    totalHours: {
      type: Number,
      required: true,
      min: 0,
    },

    description: {
      type: String,
      trim: true,
    },

    proofUrl: {
      type: String,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    approvedAt: Date,
  },
  { timestamps: true }
);

/* =====================================================
   MODEL LEVEL VALIDATION + AUTO TOTAL CALC
   ===================================================== */
timeEntrySchema.pre("validate", function (next) {
  if (this.companyType === "RWS") {
    if (
      this.weeklyTotalHours === undefined ||
      this.weeklyTotalHours < 0
    ) {
      return next(
        new Error("RWS requires valid weeklyTotalHours")
      );
    }

    this.totalHours = Number(
      parseFloat(this.weeklyTotalHours).toFixed(2)
    );
  }

  if (
    this.companyType === "Welocalized" ||
    this.companyType === "Telus"
  ) {
    if (!this.dailyHours) {
      return next(
        new Error("Daily hours required for this company type")
      );
    }

    const total = Object.values(this.dailyHours).reduce(
      (sum, val) => sum + (parseFloat(val) || 0),
      0
    );

    this.totalHours = Number(total.toFixed(2));
  }

  next();
});

/* ================= INDEXES ================= */
timeEntrySchema.index({ userId: 1, weekStart: -1 });
timeEntrySchema.index({ status: 1 });

module.exports = mongoose.model("TimeEntry", timeEntrySchema);
