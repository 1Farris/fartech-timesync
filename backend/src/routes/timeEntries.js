const express = require("express");
const multer = require("multer");
const { body } = require("express-validator");

const timeEntryController = require("../controllers/timeEntryController");
const { authenticate, authorize } = require("../middleware/auth");
const checkSubscription = require("../middleware/checkSubscription");
const validate = require("../middleware/validation");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * ===============================
 * CREATE TIME ENTRY (Weekly)
 * ===============================
 */
router.post(
  "/",
  authenticate,
  checkSubscription,
  upload.single("proof"),
  body("weekStart").isISO8601().withMessage("Valid week start date is required"),
  body("weekEnd").isISO8601().withMessage("Valid week end date is required"),
  body("companyType").notEmpty().withMessage("Company type is required"),
  body("weeklyTotalHours").optional().isFloat({ min: 0 }),
  body("description").optional().isString(),
  validate,
  timeEntryController.createTimeEntry
);

/**
 * ===============================
 * GET OWN TIME ENTRIES
 * ===============================
 */
router.get(
  "/",
  authenticate,
  timeEntryController.getTimeEntries
);

/**
 * ===============================
 * GET PENDING TEAM ENTRIES
 * (For Team Leader & Admin)
 * ===============================
 */
router.get(
  "/pending",
  authenticate,
  authorize("team-leader", "admin"),
  timeEntryController.getPendingEntries
);

/**
 * ===============================
 * UPDATE TIME ENTRY
 * ===============================
 */
router.patch(
  "/:timeEntryId",
  authenticate,
  upload.single("proof"),
  body("weekStart").optional().isISO8601(),
  body("weekEnd").optional().isISO8601(),
  body("weeklyTotalHours").optional().isFloat({ min: 0 }),
  validate,
  timeEntryController.updateTimeEntry
);

/**
 * ===============================
 * APPROVE TIME ENTRY
 * ===============================
 */
router.patch(
  "/:timeEntryId/approve",
  authenticate,
  authorize("team-leader", "admin"),
  timeEntryController.approveTimeEntry
);

/**
 * ===============================
 * REJECT TIME ENTRY     
 * ===============================
 */

router.patch(
  "/:timeEntryId/reject",
  authenticate,
  authorize("team-leader", "admin"),
  timeEntryController.rejectTimeEntry
);

module.exports = router;