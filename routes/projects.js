const express = require("express");
const {
  getProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  projectPhotoUpload,
} = require("../controllers/projectsController");

const Project = require("../models/Project");

const router = express.Router({ mergeParams: true });

//middleware advanced
const advancedResults = require("../middleware/advancedResults");
const { protect, authorize } = require("../middleware/auth");

router
  .route("/")
  .get(advancedResults(Project, "categories"), getProjects)
  .post(protect, authorize("admin"), createProject);

router.route("/:id/photo").put(authorize("admin"), projectPhotoUpload);

router
  .route("/:id")
  .get(getProject)
  .put(protect, authorize("admin"), updateProject)
  .delete(protect, authorize("admin"), deleteProject);

module.exports = router;
