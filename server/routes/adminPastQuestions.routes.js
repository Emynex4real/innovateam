const express = require("express");
const router = express.Router();
const multer = require("multer");
const adminPastQuestionsController = require("../controllers/adminPastQuestions.controller");
const { authenticate } = require("../middleware/authenticate");

// Multer: memory storage, 10MB limit, PDF/DOCX/TXT only
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, DOCX, and TXT files are allowed"), false);
    }
  },
});

// All routes require authentication
router.use(authenticate);

// Upload PDF → extract → AI parse → return for preview
router.post(
  "/upload-pdf",
  upload.single("file"),
  adminPastQuestionsController.uploadAndParse,
);

// Save reviewed questions to past_questions table
router.post("/save", adminPastQuestionsController.saveQuestions);

module.exports = router;
