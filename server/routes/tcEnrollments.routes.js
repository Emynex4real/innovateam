const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authenticate");
const { cacheMiddleware } = require("../middleware/cache");
const { checkEnrollmentLimit } = require("../middleware/subscriptionLimits");
const tcEnrollmentsController = require("../controllers/tcEnrollments.controller");

// All routes require authentication
router.use(authenticate);

// Student enrollment (checks tutor's plan capacity before allowing)
router.post(
  "/join",
  checkEnrollmentLimit(),
  tcEnrollmentsController.joinCenter,
);
router.get(
  "/my-centers",
  cacheMiddleware(120),
  tcEnrollmentsController.getEnrolledCenters,
); // Cache 2min

module.exports = router;
