const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authenticate");
const { cacheMiddleware } = require("../middleware/cache");
const tcAttemptsController = require("../controllers/tcAttempts.controller");

router.use(authenticate);

router.post("/submit", tcAttemptsController.submitAttempt);
router.get(
  "/my-attempts",
  cacheMiddleware(120),
  tcAttemptsController.getMyAttempts,
); // Cache 2min
router.get("/details/:attemptId", tcAttemptsController.getAttemptDetails);
router.get(
  "/leaderboard/:question_set_id",
  tcAttemptsController.getLeaderboard,
);
router.get(
  "/center-attempts",
  cacheMiddleware(120),
  tcAttemptsController.getCenterAttempts,
); // Cache 2min

module.exports = router;
