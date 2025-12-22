const collaborationService = require('../services/collaboration.service');

exports.createStudyGroup = async (req, res) => {
  const { name, description, subject, topic, imageUrl, centerId } = req.body;
  const result = await collaborationService.createStudyGroup(req.user.id, { name, description, subject, topic, imageUrl, centerId });
  res.json(result);
};

exports.getStudyGroups = async (req, res) => {
  const { centerId } = req.params;
  const result = await collaborationService.getStudyGroups(centerId, req.query);
  res.json(result);
};

exports.getUserStudyGroups = async (req, res) => {
  const result = await collaborationService.getUserStudyGroups(req.user.id);
  res.json(result);
};

exports.joinGroup = async (req, res) => {
  const { groupId } = req.params;
  const result = await collaborationService.joinGroup(req.user.id, groupId);
  res.json(result);
};

exports.getGroupDetail = async (req, res) => {
  const { groupId } = req.params;
  const result = await collaborationService.getGroupDetail(groupId);
  res.json(result);
};

exports.createPost = async (req, res) => {
  const { groupId } = req.params;
  const { content } = req.body;
  const result = await collaborationService.createGroupPost(req.user.id, groupId, content);
  res.json(result);
};