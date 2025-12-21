const gamificationService = require('../services/gamification.service');

exports.getMyBadges = async (req, res) => {
  try {
    const badges = await gamificationService.getStudentBadges(req.user.id);
    res.json({ success: true, badges });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllBadges = async (req, res) => {
  try {
    const badges = await gamificationService.getAllBadges();
    res.json({ success: true, badges });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.checkBadges = async (req, res) => {
  try {
    const newBadges = await gamificationService.checkAndAwardBadges(req.user.id);
    res.json({ success: true, newBadges });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getActiveChallenges = async (req, res) => {
  try {
    const { centerId } = req.params;
    const challenges = await gamificationService.getActiveChallenges(centerId);
    res.json({ success: true, challenges });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMyChallenges = async (req, res) => {
  try {
    const challenges = await gamificationService.getStudentChallenges(req.user.id);
    res.json({ success: true, challenges });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createChallenge = async (req, res) => {
  try {
    const challenge = await gamificationService.createChallenge(req.user.id, req.body);
    res.json({ success: true, challenge });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.joinChallenge = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const participation = await gamificationService.joinChallenge(req.user.id, challengeId);
    res.json({ success: true, participation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMyStudyPlan = async (req, res) => {
  try {
    const plan = await gamificationService.getStudyPlan(req.user.id);
    res.json({ success: true, plan });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.generateStudyPlan = async (req, res) => {
  try {
    const { centerId } = req.body;
    const plan = await gamificationService.generateStudyPlan(req.user.id, centerId);
    res.json({ success: true, plan });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateStudyPlanItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const item = await gamificationService.updateStudyPlanItem(itemId, req.body);
    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
