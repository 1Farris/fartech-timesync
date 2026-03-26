const Payroll = require("../models/Payroll");
const TimeEntry = require("../models/TimeEntry");
const mongoose = require("mongoose");
const XLSX = require("xlsx");

/**
 * payrollController.js
 * -----------------------
 * Contains all business logic related to payroll processing, including:  
 * - Auto-generating payroll based on approved time entries
 * - Marking payroll as paid and updating time entries accordingly
 * - Providing monthly summaries and company breakdowns for reporting 
 * This controller is designed to be used by admin users to manage payroll efficiently and accurately.
 * It ensures that payroll is generated only for approved and unpaid time entries, and provides mechanisms for adjustments and reporting.
 * The functions in this controller are protected by authentication and authorization middleware to ensure only admins can access them.     
 *   
 */

/* =========================================================
                AUTO GENERATE PAYROLL
========================================================= */

const generatePayroll = async (req, res) => {
  try {
    const entries = await TimeEntry.find({
      status: "approved",
      isPaid: false,
      locked: false,
    })
      .populate("user")
      .sort({ weekStart: 1 });

    if (entries.length === 0) {
      return res.status(400).json({
        message: "No approved unpaid entries found.",
      });
    }

    const grouped = {};

    entries.forEach((entry) => {
      const userId = entry.user._id.toString();
      if (!grouped[userId]) grouped[userId] = [];
      grouped[userId].push(entry);
    });

    const createdPayrolls = [];

    for (const userId in grouped) {
      const userEntries = grouped[userId];
      const user = userEntries[0].user;

      if (!user.payRate) {
        console.log(`Skipping user ${userId} - payRate not set.`);
        continue;
      }

      const existingOpenPayroll = await Payroll.findOne({
        user: userId,
        status: "unpaid",
      });

      if (existingOpenPayroll) {
        console.log(`Open payroll already exists for user ${userId}. Skipping.`);
        continue;
      }

      const existingPayroll = await Payroll.findOne({
        user: userId,
        entries: { $all: userEntries.map((e) => e._id) },
      });

      if (existingPayroll) {
        console.log(`Payroll already exists for user ${userId}`);
        continue;
      }

      const totalHours = userEntries.reduce(
        (sum, e) => sum + e.totalHours,
        0
      );

      const basePay = totalHours * user.payRate;

      const payroll = await Payroll.create({
        user: userId,
        entries: userEntries.map((e) => e._id),
        totalHours,
        payRate: user.payRate,

        basePay: basePay,
        totalPay: basePay,

        adjustments: [],

        periodStart: userEntries[0].weekStart,
        periodEnd: userEntries[userEntries.length - 1].weekEnd,

        status: "unpaid",
      });

      await TimeEntry.updateMany(
        { _id: { $in: payroll.entries } },
        { $set: { locked: true } }
      );

      createdPayrolls.push(payroll);
    }

    res.status(201).json({
      message: "Payroll generated successfully",
      payrolls: createdPayrolls,
    });

  } catch (error) {
    console.error("Generate Payroll Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================================================
                MARK PAYROLL AS PAID
========================================================= */

const markPayrollAsPaid = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);

    if (!payroll) {
      return res.status(404).json({
        message: "Payroll not found",
      });
    }

    if (payroll.status === "paid") {
      return res.status(400).json({
        message: "Payroll already paid",
      });
    }

    payroll.status = "paid";
    payroll.paidAt = new Date();
    await payroll.save();

    await TimeEntry.updateMany(
      { _id: { $in: payroll.entries } },
      {
        $set: {
          isPaid: true,
          paidAt: new Date(),
        },
      }
    );

    res.json({
      message: "Payroll marked as paid successfully",
    });

  } catch (error) {
    console.error("Mark Payroll Paid Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* =========================================================
                MONTHLY SUMMARY
========================================================= */

const getMonthlySummary = async (req, res) => {
  try {
    const { userId, year } = req.query;

    const matchStage = {
      status: "approved",
    };

    if (userId) {
      matchStage.user = new mongoose.Types.ObjectId(userId);
    }

    if (year) {
      const start = new Date(`${year}-01-01`);
      const end = new Date(`${year}-12-31`);

      matchStage.weekStart = {
        $gte: start,
        $lte: end,
      };
    }

    const summary = await TimeEntry.aggregate([
      { $match: matchStage },

      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userData",
        },
      },

      { $unwind: "$userData" },

      {
        $group: {
          _id: {
            year: { $year: "$weekStart" },
            month: { $month: "$weekStart" },
          },
          totalHours: { $sum: "$totalHours" },
          totalPay: {
            $sum: {
              $multiply: ["$totalHours", "$userData.payRate"],
            },
          },
        },
      },

      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const formatted = summary.map((item) => ({
      year: item._id.year,
      month: item._id.month,
      totalHours: item.totalHours,
      totalPay: item.totalPay,
    }));

    res.json(formatted);

  } catch (error) {
    console.error("Monthly Summary Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================================================
                PAID VS UNPAID STATS
========================================================= */

const getPaidVsUnpaidStats = async (req, res) => {
  try {
    const paid = await Payroll.aggregate([
      { $match: { status: "paid" } },
      {
        $group: {
          _id: null,
          totalPay: { $sum: "$totalPay" },
          totalHours: { $sum: "$totalHours" },
          count: { $sum: 1 },
        },
      },
    ]);

    const unpaid = await Payroll.aggregate([
      { $match: { status: "unpaid" } },
      {
        $group: {
          _id: null,
          totalPay: { $sum: "$totalPay" },
          totalHours: { $sum: "$totalHours" },
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      paid: paid[0] || { totalPay: 0, totalHours: 0, count: 0 },
      unpaid: unpaid[0] || { totalPay: 0, totalHours: 0, count: 0 },
    });

  } catch (error) {
    console.error("Paid vs Unpaid Stats Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================================================
        COMPANY-BASED PAYROLL BREAKDOWN
========================================================= */

const getCompanyPayrollBreakdown = async (req, res) => {
  try {
    const breakdown = await TimeEntry.aggregate([
      { $match: { status: "approved" } },

      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userData",
        },
      },

      { $unwind: "$userData" },

      {
        $addFields: {
          calculatedPay: {
            $multiply: ["$totalHours", "$userData.payRate"],
          },
        },
      },

      {
        $group: {
          _id: "$userData.company",
          totalHours: { $sum: "$totalHours" },
          totalPaid: {
            $sum: {
              $cond: [{ $eq: ["$isPaid", true] }, "$calculatedPay", 0],
            },
          },
          totalUnpaid: {
            $sum: {
              $cond: [{ $eq: ["$isPaid", false] }, "$calculatedPay", 0],
            },
          },
          employees: { $addToSet: "$userData._id" },
        },
      },

      {
        $project: {
          _id: 0,
          company: "$_id",
          totalHours: 1,
          totalPaid: 1,
          totalUnpaid: 1,
          employeeCount: { $size: "$employees" },
        },
      },

      { $sort: { company: 1 } },
    ]);

    res.json(breakdown);

  } catch (error) {
    console.error("Company Breakdown Error:", error);
    res.status(500).json({
      message: "Error fetching company breakdown",
    });
  }
};

/* =========================================================
                GET ALL PAYROLL
========================================================= */

const getAllPayrolls = async (req, res) => {
  try {
    const payrolls = await Payroll.find()
      .populate("user", "name email role")
      .sort({ createdAt: -1 })
      .lean();

    res.json(payrolls);

  } catch (error) {
    console.error("Get Payroll Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================================================
                EXPORT PAYROLL TO EXCEL
========================================================= */

const exportPayrollToExcel = async (req, res) => {
  try {
    const payrolls = await Payroll.find()
      .populate("user")
      .sort({ createdAt: -1 });

    const data = payrolls.map((p) => ({
      Employee: p.user?.name || "N/A",
      Company: p.user?.company || "N/A",
      TotalHours: p.totalHours,
      TotalPay: p.totalPay,
      Status: p.status,
      CreatedAt: p.createdAt,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Payroll");

    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=payroll.xlsx"
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.send(buffer);

  } catch (error) {
    console.error("Export Payroll Error:", error);
    res.status(500).json({ message: "Export failed" });
  }
};


/* =========================================================
            ADD PAYROLL ADJUSTMENT (ADMIN)
========================================================= */

const addPayrollAdjustment = async (req, res) => {
  try {
    const { type, title, reason, amount } = req.body;

    if (!type || !amount || !title) {
      return res.status(400).json({
        message: "Type, title and amount are required",
      });
    }

    const payroll = await Payroll.findById(req.params.id);

    if (!payroll) {
      return res.status(404).json({
        message: "Payroll not found",
      });
    }

    // Prevent editing paid payroll
    if (payroll.status === "paid") {
      return res.status(400).json({
        message: "Cannot adjust a paid payroll",
      });
    }

    const adjustmentAmount = Number(amount);

    payroll.adjustments.push({
      type,
      title,
      reason,
      amount: adjustmentAmount,
    });

    /* Recalculate payroll total */

    const adjustmentTotal = payroll.adjustments.reduce((sum, adj) => {
      if (adj.type === "bonus") return sum + adj.amount;
      if (adj.type === "penalty") return sum - adj.amount;
      return sum;
    }, 0);

    payroll.totalPay = payroll.basePay + adjustmentTotal;

    await payroll.save();

    res.json({
      message: "Adjustment added successfully",
      payroll,
    });

  } catch (error) {
    console.error("Add Adjustment Error:", error);
    res.status(500).json({
      message: "Adjustment failed",
    });
  }
};

/* =========================================================
                GET SINGLE PAYROLL
========================================================= */

const getPayrollById = async (req, res) => {
  try {

    const payroll = await Payroll.findById(req.params.id)
      .populate("user");

    if (!payroll) {
      return res.status(404).json({
        message: "Payroll not found",
      });
    }

    res.json(payroll);

  } catch (error) {
    console.error("Get Payroll By Id Error:", error);

    res.status(500).json({
      message: "Error fetching payroll",
    });
  }
};

/* =========================================================
                    EXPORTS
========================================================= */

module.exports = {
  generatePayroll,
  markPayrollAsPaid,
  getMonthlySummary,
  getPaidVsUnpaidStats,
  getCompanyPayrollBreakdown,
  getAllPayrolls,
  exportPayrollToExcel,
  addPayrollAdjustment,
  getPayrollById,
};