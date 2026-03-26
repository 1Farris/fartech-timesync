const express = require("express");
const teamController = require("../controllers/teamController");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

/**
 * teams.js
 * -----------------------
 * Routes for managing teams, including team creation, member management, and team retrieval. 
 * Protected by authentication and role-based authorization middleware. 
 */

/* ======================================================
   ADMIN ROUTES
====================================================== */

// Create Team (Admin Only)
router.post(
  "/",
  authenticate,
  authorize("admin"),
  teamController.createTeam
);

// Get All Teams (Admin Only)
router.get(
  "/",
  authenticate,
  authorize("admin"),
  teamController.getAllTeams
);

// Delete Team (Admin Only)
router.delete(
  "/:teamId",
  authenticate,
  authorize("admin"),
  teamController.deleteTeam
);

/* ======================================================
   ADMIN + TEAM LEADER ROUTES
====================================================== */

// Add Member (Admin OR Team Leader)
router.post(
  "/members",
  authenticate,
  authorize("admin", "team-leader"),
  teamController.addMember
);

// Remove Member (Admin OR Team Leader)
router.post(
  "/remove-member",
  authenticate,
  authorize("admin", "team-leader"),
  teamController.removeMember
);

// Get Single Team (Admin OR Leader of that team)
router.get(
  "/:teamId",
  authenticate,
  teamController.getTeamMembers
);

module.exports = router;