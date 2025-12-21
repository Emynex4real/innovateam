const express = require('express');
const router = express.Router();
const gamificationController = require('../controllers/gamification.controller');
const { authenticate } = require('../middleware/authenticate');

// Badge routes
router.get('/badges/my', authenticate, gamificationController.getMyBadges);
router.get('/badges/all', authenticate, gamificationController.getAllBadges);
router.post('/badges/check', authenticate, gamificationController.checkBadges);

// Challenge routes
router.get('/challenges/center/:centerId', authenticate, gamificationController.getActiveChallenges);
router.get('/challenges/my', authenticate, gamificationController.getMyChallenges);
router.post('/challenges', authenticate, gamificationController.createChallenge);
router.post('/challenges/:challengeId/join', authenticate, gamificationController.joinChallenge);

// Study plan routes
router.get('/study-plan/my', authenticate, gamificationController.getMyStudyPlan);
router.post('/study-plan/generate', authenticate, gamificationController.generateStudyPlan);
router.patch('/study-plan/items/:itemId', authenticate, gamificationController.updateStudyPlanItem);

module.exports = router;
