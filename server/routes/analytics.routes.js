const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authenticate');
const analyticsController = require('../controllers/analytics.controller');

router.use(authenticate);

router.get('/heatmap/:centerId', analyticsController.getPerformanceHeatmap);
router.get('/center/:centerId', analyticsController.getCenterAnalytics);
router.get('/questions/:centerId', analyticsController.getQuestionAnalytics);
router.get('/export/pdf/:centerId', analyticsController.exportPDF);
router.get('/export/excel/:centerId', analyticsController.exportExcel);
router.get('/insights/:studentId/:centerId', analyticsController.getPredictiveInsights);

module.exports = router;
