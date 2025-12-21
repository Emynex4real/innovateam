const analyticsService = require('../services/analytics.service');
const { logger } = require('../utils/logger');

exports.getPerformanceHeatmap = async (req, res) => {
  try {
    const { centerId } = req.params;
    const result = await analyticsService.getPerformanceHeatmap(req.user.id, centerId);
    res.json(result);
  } catch (error) {
    logger.error('Get heatmap error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getCenterAnalytics = async (req, res) => {
  try {
    const { centerId } = req.params;
    const result = await analyticsService.getCenterAnalytics(centerId);
    res.json(result);
  } catch (error) {
    logger.error('Get center analytics error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getQuestionAnalytics = async (req, res) => {
  try {
    const { centerId } = req.params;
    const result = await analyticsService.getQuestionAnalytics(centerId);
    res.json(result);
  } catch (error) {
    logger.error('Get question analytics error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.exportPDF = async (req, res) => {
  try {
    const { centerId } = req.params;
    const result = await analyticsService.exportPDF(centerId);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=analytics-${centerId}.pdf`);
    res.send(result.pdf);
  } catch (error) {
    logger.error('Export PDF error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.exportExcel = async (req, res) => {
  try {
    const { centerId } = req.params;
    const result = await analyticsService.exportExcel(centerId);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=analytics-${centerId}.xlsx`);
    res.send(result.excel);
  } catch (error) {
    logger.error('Export Excel error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getPredictiveInsights = async (req, res) => {
  try {
    const { studentId, centerId } = req.params;
    const result = await analyticsService.getPredictiveInsights(studentId, centerId);
    res.json(result);
  } catch (error) {
    logger.error('Get predictive insights error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = exports;
