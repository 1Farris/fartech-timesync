const express = require("express");

const {
  generatePayroll,
  getAllPayroll,
  getMonthlySummary,
  getPaidVsUnpaidStats,
  markPayrollAsPaid,
  getCompanyPayrollBreakdown,
  exportPayrollToExcel,
  addPayrollAdjustment,
  getPayrollById,
  getAllPayrolls,
} = require("../controllers/payrollController");

const { authenticate, authorize } = require("../middleware/auth");

/**
 * payrollRoutes.js
 * -----------------------
 * Routes for handling payroll-related operations, including payroll generation, retrieval, 
 * statistics, and adjustments. 
 * Protected by authentication and role-based authorization middleware.   
 */

const router = express.Router();

/**
 * Generate payroll
 */
router.post(
  "/generate",
  authenticate,
  authorize("admin"),
  generatePayroll
);

/**
 * Get all payroll
 */
router.get(
  "/",
  authenticate,
  authorize("admin"),
  getAllPayrolls
);

/**
 * Monthly summary
 */
router.get(
  "/monthly-summary",
  authenticate,
  authorize("admin, team-leader"),
  getMonthlySummary
);

/**
 * Company payroll breakdown
 */
router.get(
  "/stats/company-breakdown",
  authenticate,
  authorize("admin"),
  getCompanyPayrollBreakdown
);

/**
 * Paid vs Unpaid statistics
 */
router.get(
  "/stats/paid-vs-unpaid",
  authenticate,
  authorize("admin"),
  getPaidVsUnpaidStats
);

/**
 * Export payroll to Excel
 */
router.get(
  "/export/excel",
  authenticate,
  authorize("admin"),
  exportPayrollToExcel
);

/**
 * Mark payroll as paid
 */
router.put(
  "/:id/mark-paid",
  authenticate,
  authorize("admin"),
  markPayrollAsPaid
);

/**
 * Add payroll adjustment
 */

router.post(
  "/:id/adjustment",
  authenticate,
  authorize("admin"),
  addPayrollAdjustment
);

/**
 * Get payroll by ID
 */
router.get(
  "/:id",
  authenticate,
  authorize("admin"),
  getPayrollById
);

module.exports = router;