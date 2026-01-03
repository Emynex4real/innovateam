const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authenticate');
const tcAttemptsController = require('../controllers/tcAttempts.controller');

router.use(authenticate);

router.post('/submit', tcAttemptsController.submitAttempt);
router.get('/my-attempts', tcAttemptsController.getMyAttempts);
router.get('/details/:attemptId', tcAttemptsController.getAttemptDetails);
router.get('/leaderboard/:question_set_id', tcAttemptsController.getLeaderboard);
router.get('/center-attempts', tcAttemptsController.getCenterAttempts);

module.exports = router;
