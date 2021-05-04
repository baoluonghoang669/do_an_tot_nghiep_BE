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

router.route("/").get(getMessage).post(createMessage);

router
    .route("/:id")
    .delete(protect, authorize("admin"), deleteMessage)
    .put(protect, authorize("admin"), updateMessage);

module.exports = router;