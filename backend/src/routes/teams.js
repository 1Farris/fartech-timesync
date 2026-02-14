const express = require('express');
const teamController = require('../controllers/teamController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', [
  authenticate,
  authorize('team-leader', 'admin')
], teamController.createTeam);

router.post('/members', [
  authenticate,
  authorize('team-leader', 'admin')
], teamController.addMember);

router.get('/:teamId', authenticate, teamController.getTeamMembers);

module.exports = router;