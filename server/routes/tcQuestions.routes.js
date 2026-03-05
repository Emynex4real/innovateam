const express = require("express");
const router = express.Router();
const multer = require("multer");
const { authenticate } = require("../middleware/authenticate");
const { checkLimit } = require("../middleware/subscriptionLimits");
const tcQuestionsController = require("../controllers/tcQuestions.controller");

// Multer config for image uploads (5MB limit, memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ];
    cb(null, allowed.includes(file.mimetype));
  },
});

// All routes require authentication
router.use(authenticate);

// Image upload
router.post(
  "/upload-image",
  upload.single("image"),
  tcQuestionsController.uploadQuestionImage,
);

// Question management (with subscription limit checks on creation)
router.post("/", checkLimit("questions"), tcQuestionsController.createQuestion);
router.post("/generate-ai", tcQuestionsController.generateQuestions);
router.post("/parse-bulk", tcQuestionsController.parseBulkQuestions);
router.post(
  "/save-bulk",
  checkLimit("questions", (req) => req.body.questions?.length || 1),
  tcQuestionsController.saveBulkQuestions,
);
router.get("/", tcQuestionsController.getQuestions);
router.put("/:id", tcQuestionsController.updateQuestion);
router.delete("/:id", tcQuestionsController.deleteQuestion);

module.exports = router;
