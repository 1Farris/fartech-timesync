const Team = require("../models/Team");
const User = require("../models/User");
const mongoose = require("mongoose");

/**
 * Team Controller
 * -----------------------
 * Handles team management: creation, member assignment, and retrieval. 
 */

/* ======================================================
   CREATE TEAM (ADMIN ONLY)
====================================================== */
exports.createTeam = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        error: "Only admin can create teams",
      });
    }

    const { name, description, leaderId } = req.body;

    if (!name || !leaderId) {
      return res.status(400).json({
        error: "Team name and leader are required",
      });
    }

    // Prevent duplicate team name
    const existingTeam = await Team.findOne({ name });
    if (existingTeam) {
      return res.status(400).json({
        error: "Team name already exists",
      });
    }

    const leader = await User.findById(leaderId);
    if (!leader || leader.role !== "team-leader") {
      return res.status(400).json({
        error: "Selected user is not a team leader",
      });
    }

    if (leader.teamId) {
      return res.status(400).json({
        error: "Leader is already assigned to another team",
      });
    }

    const team = await Team.create({
      name,
      description,
      leaderId: leader._id,
      members: [leader._id],
    });

    leader.teamId = team._id;
    await leader.save();

    const populatedTeam = await Team.findById(team._id)
      .populate("leaderId", "firstName lastName email role")
      .populate("members", "firstName lastName email role");

    res.status(201).json({
      success: true,
      message: "Team created successfully",
      team: populatedTeam,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

/* ======================================================
   ADD MEMBER (ADMIN OR TEAM LEADER)
====================================================== */
exports.addMember = async (req, res) => {
  try {
    const { teamId, userId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(teamId) ||
        !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid IDs" });
    }

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ error: "Team not found" });

    const isAdmin = req.user.role === "admin";
    const isLeader = team.leaderId.toString() === req.user._id.toString();

    if (!isAdmin && !isLeader) {
      return res.status(403).json({
        error: "Not authorized to add members",
      });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.teamId) {
      return res.status(400).json({
        error: "User already belongs to a team",
      });
    }

    const alreadyMember = team.members.some(
      (member) => member.toString() === userId
    );

    if (alreadyMember) {
      return res.status(400).json({
        error: "User already in this team",
      });
    }

    team.members.push(user._id);
    await team.save();

    user.teamId = team._id;
    await user.save();

    res.json({
      success: true,
      message: "Member added successfully",
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

/* ======================================================
   REMOVE MEMBER (ADMIN OR TEAM LEADER)
====================================================== */
exports.removeMember = async (req, res) => {
  try {
    const { teamId, userId } = req.body;

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ error: "Team not found" });

    const isAdmin = req.user.role === "admin";
    const isLeader = team.leaderId.toString() === req.user._id.toString();

    if (!isAdmin && !isLeader) {
      return res.status(403).json({
        error: "Not authorized to remove members",
      });
    }

    if (team.leaderId.toString() === userId) {
      return res.status(400).json({
        error: "Cannot remove team leader",
      });
    }

    team.members = team.members.filter(
      (member) => member.toString() !== userId
    );

    await team.save();

    await User.findByIdAndUpdate(userId, { teamId: null });

    res.json({
      success: true,
      message: "Member removed successfully",
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

/* ======================================================
   GET ALL TEAMS (ADMIN ONLY)
====================================================== */
exports.getAllTeams = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        error: "Only admin can view teams",
      });
    }

    const teams = await Team.find()
      .populate("leaderId", "firstName lastName email role")
      .populate("members", "firstName lastName email role");

    res.json({ success: true, teams });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ======================================================
   GET SINGLE TEAM (ADMIN OR LEADER)
====================================================== */
exports.getTeamMembers = async (req, res) => {
  try {
    const { teamId } = req.params;

    const team = await Team.findById(teamId)
      .populate("leaderId", "firstName lastName email role")
      .populate("members", "firstName lastName email role");

    if (!team) return res.status(404).json({ error: "Team not found" });

    const isAdmin = req.user.role === "admin";
    const isLeader = team.leaderId._id.toString() === req.user._id.toString();

    if (!isAdmin && !isLeader) {
      return res.status(403).json({
        error: "Not authorized to view this team",
      });
    }

    res.json({ success: true, team });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ======================================================
   DELETE TEAM (ADMIN ONLY)
====================================================== */
exports.deleteTeam = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        error: "Only admin can delete teams",
      });
    }

    const { teamId } = req.params;

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ error: "Team not found" });

    await User.updateMany(
      { teamId: teamId },
      { $set: { teamId: null } }
    );

    await team.deleteOne();

    res.json({
      success: true,
      message: "Team deleted successfully",
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};