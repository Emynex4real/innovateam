const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authenticate');
const { checkLimit } = require('../middleware/subscriptionLimits');
const tcQuestionSetsController = require('../controllers/tcQuestionSets.controller');

router.use(authenticate);

router.post('/', checkLimit('tests'), tcQuestionSetsController.createQuestionSet);
router.get('/', tcQuestionSetsController.getQuestionSets);
router.get('/public/all', tcQuestionSetsController.getPublicTests);
router.get('/:id', tcQuestionSetsController.getQuestionSet);
router.put('/:id', tcQuestionSetsController.updateQuestionSet);
router.put('/:id/toggle-answers', tcQuestionSetsController.toggleAnswers);
router.delete('/:id', tcQuestionSetsController.deleteQuestionSet);

module.exports = router;
