const express = require("express");
const {
  getMessage,
  createMessage,
  deleteMessage,
  updateMessage,
} = require("../controllers/messagesController");
const router = express.Router();

const { protect, authorize } = require("../middleware/auth");

//authorize for admin
router.use(protect);
router.use(authorize("admin"));

router.route("/").get(getMessage).post(createMessage);

router.route("/:id").delete(deleteMessage).put(updateMessage);

module.exports = router;
