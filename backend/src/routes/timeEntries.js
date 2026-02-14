const express = require('express');
const multer = require('multer');
const { body } = require('express-validator');
const timeEntryController = require('../controllers/timeEntryController');
const { authenticate, authorize } = require('../middleware/auth');
const checkSubscription = require('../middleware/subscription');
const validate = require('../middleware/validation');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', [
  authenticate,
  checkSubscription,
  upload.single('proof'),
  body('date').isISO8601(),
  body('hours').isInt({ min: 0, max: 24 }),
  body('minutes').isInt({ min: 0, max: 59 }),
  body('taskType').notEmpty(),
  validate
], timeEntryController.createTimeEntry);

router.get('/', authenticate, timeEntryController.getTimeEntries);
router.post('/clock-in', authenticate, checkSubscription, timeEntryController.clockIn);
router.post('/clock-out', authenticate, timeEntryController.clockOut);

router.patch('/:timeEntryId/approve', [
  authenticate,
  authorize('team-leader', 'admin')
], timeEntryController.approveTimeEntry);

module.exports = router;