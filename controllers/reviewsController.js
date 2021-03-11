const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Review = require("../models/Review");
const Project = require("../models/Project");

//@desc Get all reviews
//@route Get /api/v1/reviews
//@route Get /api/v1/projects/:projectId/reviews
//@access Private
exports.getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.projectId) {
    const reviews = await Review.find({
      project: req.params.projectId,
    }).populate({
      path: "user",
      select: "name email",
    });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

//@desc Get single review
//@route Get /api/v1/reviews/:id
//@access Private
exports.getReview = asyncHandler(async (req, res, next) => {
  const reviews = await Review.findById(req.params.id).populate({
    path: "project",
    select: "name description",
  });

  if (!reviews) {
    return next(
      new ErrorResponse(`No review found with the id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews,
  });
});

//@desc Add review
//@route Post /api/v1/project/:projectId/reviews
//@access Private
exports.addReview = asyncHandler(async (req, res, next) => {
  req.body.project = req.params.projectId;
  req.body.user = req.user.id;

  const project = await Project.findById(req.params.projectId);

  if (!project) {
    return next(
      new ErrorResponse(
        `No Project found with the id of ${req.params.projectId}`,
        404
      )
    );
  }

  const reviews = await Review.create(req.body);

  res.status(200).json({
    success: true,
    data: reviews,
  });
});

//@desc Update review
//@route Put /api/v1/reviews/:id
//@access Private
exports.updateReview = asyncHandler(async (req, res, next) => {
  let reviews = await Review.findById(req.params.id);

  if (!reviews) {
    return next(
      new ErrorResponse(`No review found with the id of ${req.params.id}`, 404)
    );
  }

  //Make sure review belongs to user or user is an admin
  if (reviews.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse(`Not authorized to update review`, 401));
  }

  reviews = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: reviews,
  });
});

//@desc Delete
//@route Delete /api/v1/reviews/:id
//@access Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
  let reviews = await Review.findById(req.params.id);

  if (!reviews) {
    return next(
      new ErrorResponse(`No review found with the id of ${req.params.id}`, 404)
    );
  }

  //Make sure review belongs to user or user is an admin
  if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse(`Not authorized to delete review`, 401));
  }

  await reviews.remove();

  res.status(200).json({
    success: true,
  });
});
