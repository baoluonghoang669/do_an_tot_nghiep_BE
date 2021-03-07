const express = require("express");
const {
  getCategories,
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoriesController");

const Category = require("../models/Category");

const router = express.Router();

//Include other resource routers
const projectRouter = require("./projects");

//middleware advanced
const advancedResults = require("../middleware/advancedResults");
const { protect, authorize } = require("../middleware/auth");

//Re-router into other resource routers
router.use("/:categoriesId/projects", projectRouter);

router
  .route("/")
  .get(
    advancedResults(Category, {
      path: "projects",
      select: "name description",
    }),
    getCategories
  )
  .post(protect, authorize("admin"), createCategory);

router
  .route("/:id")
  .get(getCategory)
  .put(protect, authorize("admin"), updateCategory)
  .delete(protect, authorize("admin"), deleteCategory);

module.exports = router;
