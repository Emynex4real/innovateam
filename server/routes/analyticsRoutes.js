const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authenticate');
const analyticsService = require('../services/analyticsService');
const tutorAnalyticsService = require('../services/tutorAnalyticsService');
const predictionService = require('../services/predictionService');
const { logger } = require('../utils/logger');

// All analytics routes require authentication
router.use(authenticate);

// ============================================
// STUDENT ANALYTICS ROUTES
// ============================================

// Get student's overall analytics
router.get('/student/analytics/:centerId', async (req, res) => {
  try {
    const result = await analyticsService.getStudentAnalytics(req.user.id, req.params.centerId);
    res.json(result);
  } catch (error) {
    logger.error('Error getting student analytics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get student's subject-wise performance
router.get('/student/subjects/:centerId', async (req, res) => {
  try {
    const result = await analyticsService.getStudentSubjectAnalytics(req.user.id, req.params.centerId);
    res.json(result);
  } catch (error) {
    logger.error('Error getting subject analytics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get performance trends
router.get('/student/trends/:centerId', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const result = await analyticsService.getPerformanceTrends(req.user.id, req.params.centerId, days);
    res.json(result);
  } catch (error) {
    logger.error('Error getting trends:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get study recommendations
router.get('/student/recommendations/:centerId', async (req, res) => {
  try {
    const result = await analyticsService.getStudyRecommendations(req.user.id, req.params.centerId);
    res.json(result);
  } catch (error) {
    logger.error('Error getting recommendations:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Log study session
router.post('/student/session', async (req, res) => {
  try {
    const result = await analyticsService.logStudySession(req.user.id, req.body.centerId, req.body);
    res.json(result);
  } catch (error) {
    logger.error('Error logging session:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// TUTOR ANALYTICS ROUTES
// ============================================

// Get center analytics dashboard
router.get('/tutor/center-analytics', async (req, res) => {
  try {
    const result = await tutorAnalyticsService.getCenterAnalytics(req.user.id);
    res.json(result);
  } catch (error) {
    logger.error('Error getting center analytics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get detailed student performance (tutor view)
router.get('/tutor/student-performance/:studentId/:centerId', async (req, res) => {
  try {
    const result = await tutorAnalyticsService.getStudentDetailedPerformance(
      req.user.id,
      req.params.studentId,
      req.params.centerId
    );
    res.json(result);
  } catch (error) {
    logger.error('Error getting student performance:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get question analysis
router.get('/tutor/question-analysis/:centerId', async (req, res) => {
  try {
    const result = await tutorAnalyticsService.getQuestionAnalysis(req.user.id, req.params.centerId);
    res.json(result);
  } catch (error) {
    logger.error('Error getting question analysis:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get test analytics
router.get('/tutor/test-analytics/:centerId', async (req, res) => {
  try {
    const result = await tutorAnalyticsService.getTestAnalytics(req.user.id, req.params.centerId);
    res.json(result);
  } catch (error) {
    logger.error('Error getting test analytics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate tutor insights
router.get('/tutor/insights/:centerId', async (req, res) => {
  try {
    const result = await tutorAnalyticsService.generateTutorInsights(req.user.id, req.params.centerId);
    res.json(result);
  } catch (error) {
    logger.error('Error generating insights:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// AT-RISK DETECTION ROUTES
// ============================================

// Get at-risk students
router.get('/predictions/at-risk/:centerId', async (req, res) => {
  try {
    const result = await predictionService.getAtRiskStudents(req.user.id, req.params.centerId);
    res.json(result);
  } catch (error) {
    logger.error('Error getting at-risk students:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update at-risk predictions (can be called periodically)
router.post('/predictions/update-at-risk/:centerId', async (req, res) => {
  try {
    const result = await predictionService.updateCenterAtRiskPredictions(req.params.centerId);
    res.json(result);
  } catch (error) {
    logger.error('Error updating predictions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get at-risk score for a student (instant calculation)
router.get('/predictions/score/:studentId/:centerId', async (req, res) => {
  try {
    const result = await predictionService.calculateAtRiskScore(
      req.params.studentId,
      req.params.centerId
    );
    res.json({ success: true, ...result });
  } catch (error) {
    logger.error('Error calculating at-risk score:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get student recommendations
router.get('/predictions/recommended-topics/:studentId/:centerId', async (req, res) => {
  try {
    const recommended = await predictionService.getRecommendedTopics(
      req.params.studentId,
      req.params.centerId
    );
    res.json({ success: true, recommended });
  } catch (error) {
    logger.error('Error getting recommendations:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Predict pass rate
router.get('/predictions/pass-rate/:studentId/:centerId', async (req, res) => {
  try {
    const difficulty = req.query.difficulty || 'medium';
    const result = await predictionService.predictPassRate(
      req.params.studentId,
      req.params.centerId,
      difficulty
    );
    res.json({ success: true, ...result });
  } catch (error) {
    logger.error('Error predicting pass rate:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
