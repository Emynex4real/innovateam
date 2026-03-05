const express = require("express");
const router = express.Router();
const pastQuestionsController = require("../controllers/pastQuestions.controller");
const { authenticate } = require("../middleware/authenticate");

// All routes require authentication
router.use(authenticate);

// Browse/search past questions
router.get("/", pastQuestionsController.getPastQuestions);

// Get filter options
router.get("/subjects", pastQuestionsController.getSubjects);
router.get("/years", pastQuestionsController.getYears);
router.get("/stats", pastQuestionsController.getStats);

// Import to tutor's bank
router.post("/import", pastQuestionsController.importToBank);

// Admin seed
router.post("/seed", pastQuestionsController.seedQuestions);

module.exports = router;
