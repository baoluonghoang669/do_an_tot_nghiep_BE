const path = require("path");
const Project = require("../models/Project");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Category = require("../models/Category");

//@desc Get all projects
//@route Get /api/v1/projects
//@route Get /api/v1/categories/:categoriesId/projects
//@access Public

exports.getProjects = asyncHandler(async (req, res, next) => {
  if (req.params.categoriesId) {
    const project = await Project.find({
      categories: req.params.categoriesId,
    });

    return res.status(200).json({
      success: true,
      cout: project.length,
      data: project,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

//@desc Get single project
//@route Get /api/v1/projects/:id
//@access Public
exports.getProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id).populate({
    path: "categories",
  });

  if (!project) {
    return next(
      new ErrorResponse(`Project not found with id of ${req.params.id}`),
      404
    );
  }

  res.status(200).json({
    success: true,
    data: project,
  });
});

//@desc Add a new project
//@route Post /api/v1/categories/:categoriesId/projects
//@access Private
exports.createProject = asyncHandler(async (req, res, next) => {
  req.body.categories = req.params.categoriesId;

  const category = await Category.findById(req.params.categoriesId);

  if (!category) {
    return next(
      new ErrorResponse(
        `No category with the id of ${req.params.categoriesId}`
      ),
      404
    );
  }

  const project = await Project.create(req.body);

  res.status(200).json({
    success: true,
    data: project,
  });
});

//@desc Update project
//@route Put /api/v1/projects/:id
//@access Private
exports.updateProject = asyncHandler(async (req, res, next) => {
  let project = await Project.findById(req.params.id);

  if (!project) {
    return next(
      new ErrorResponse(`Project not found with id of ${req.params.id}`),
      404
    );
  }

  project = await Project.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: project,
  });
});

//@desc Delete project
//@route Delete /api/v1/projects/:id
//@access Private
exports.deleteProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return next(
      new ErrorResponse(`Project not found with id of ${req.params.id}`),
      404
    );
  }

  await project.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});

//@desc Upload photo for project
//@route PUT /api/v1/projects/:id/photo
//@access Private
exports.projectPhotoUpload = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return next(
      new ErrorResponse(`Project not found with id of ${req.params.id}`),
      404
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`), 404);
  }

  const file = req.files.file;

  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse(`Please upload an image file`), 404);
  }

  //check filesize
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`
      ),
      404
    );
  }

  //Create custom filename
  file.name = `photo_${project._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.log(err);
      return next(new ErrorResponse(`Problem with upload file`), 500);
    }

    await Project.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(200).json({
      success: true,
      data: file.name,
    });
  });
});
