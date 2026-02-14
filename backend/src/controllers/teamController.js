const Team = require('../models/Team');
const User = require('../models/User');

exports.createTeam = async (req, res) => {
  try {
    const { name, description } = req.body;

    const team = await Team.create({
      name,
      description,
      leaderId: req.user._id,
      members: [req.user._id]
    });

    res.status(201).json({
      success: true,
      message: 'Team created successfully',
      team
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addMember = async (req, res) => {
  try {
    const { teamId, userId } = req.body;

    const team = await Team.findById(teamId);
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    if (team.leaderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only team leader can add members' });
    }

    if (!team.members.includes(userId)) {
      team.members.push(userId);
      await team.save();

      await User.findByIdAndUpdate(userId, { teamId });
    }

    res.json({
      success: true,
      message: 'Member added successfully',
      team
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTeamMembers = async (req, res) => {
  try {
    const { teamId } = req.params;

    const team = await Team.findById(teamId)
      .populate('members', 'firstName lastName email role')
      .populate('leaderId', 'firstName lastName email');

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.json({ success: true, team });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};