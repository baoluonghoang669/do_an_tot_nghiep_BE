const express = require("express");
const {
  getReviews,
  addReview,
  getReview,
  updateReview,
  deleteReview,
  exportAllExcels,
  exportExcel,
  importExcel,
} = require("../controllers/reviewsController");

const Review = require("../models/Review");
const router = express.Router({ mergeParams: true });

//middleware advanced
const advancedResults = require("../middleware/advancedResults");
const upload = require("../middleware/upload");
const { protect, authorize } = require("../middleware/auth");

router
  .route("/")
  .get(
    advancedResults(Review, {
      path: "project",
      select: "name description",
    }),
    getReviews
  )
  .post(protect, authorize("user", "admin"), addReview);

router.route("/export").get(exportAllExcels);
router.route("/import").post(importExcel);
router.route("/export/:id").get(exportExcel);

router
  .route("/:id")
  .get(getReview)
  .put(protect, authorize("user", "admin"), updateReview)
  .delete(protect, authorize("user", "admin"), deleteReview);

module.exports = router;
