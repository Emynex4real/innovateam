const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authenticate');
const analyticsController = require('../controllers/analytics.controller');

router.use(authenticate);

// Tutor/Admin routes
router.get('/heatmap/:centerId', analyticsController.getPerformanceHeatmap);
router.get('/center/:centerId', analyticsController.getCenterAnalytics);
router.get('/questions/:centerId', analyticsController.getQuestionAnalytics);
router.get('/export/pdf/:centerId', analyticsController.exportPDF);
router.get('/export/excel/:centerId', analyticsController.exportExcel);
router.get('/insights/:studentId/:centerId', analyticsController.getPredictiveInsights);

// Student routes
router.get('/student/analytics/:centerId', analyticsController.getStudentAnalytics);
router.get('/student/subjects/:centerId', analyticsController.getSubjectAnalytics);
router.get('/student/trends/:centerId', analyticsController.getPerformanceTrends);
router.get('/student/recommendations/:centerId', analyticsController.getRecommendations);
router.post('/student/session', analyticsController.logStudySession);

// Prediction routes
router.get('/predictions/at-risk/:centerId', analyticsController.getAtRiskStudents);
router.post('/predictions/update-at-risk/:centerId', analyticsController.updateAtRiskPredictions);
router.get('/predictions/score/:studentId/:centerId', analyticsController.calculateAtRiskScore);
router.get('/predictions/recommended-topics/:studentId/:centerId', analyticsController.getRecommendedTopics);
router.get('/predictions/pass-rate/:studentId/:centerId', analyticsController.predictPassRate);

module.exports = router;
