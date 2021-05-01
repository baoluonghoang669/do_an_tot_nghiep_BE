const express = require("express");
const {
    getProjects,
    createProject,
    getProject,
    updateProject,
    deleteProject,
    projectPhotoUpload,
    exportAllExcels,
    exportExcel,
    importExcel,
} = require("../controllers/projectsController");

const Project = require("../models/Project");

const router = express.Router({ mergeParams: true });

//Include other resource routers
const reviewsRouter = require("./reviews");

//middleware advanced
const advancedResults = require("../middleware/advancedResults");
const upload = require("../middleware/upload");
const { protect, authorize } = require("../middleware/auth");

//Re-router into other resource routers
router.use("/:projectId/reviews", reviewsRouter);

router
    .route("/")
    .get(advancedResults(Project, "categories"), getProjects)
    .post(protect, authorize("admin"), createProject);

router.route("/:id/photo").put(projectPhotoUpload);
router.route("/export").get(exportAllExcels);
router.route("/export/:id").get(exportExcel);
router.route("/import").post(upload.single("file"), importExcel);
router
    .route("/:id")
    .get(getProject)
    .put(protect, authorize("admin"), updateProject)
    .delete(protect, authorize("admin"), deleteProject);

module.exports = router;