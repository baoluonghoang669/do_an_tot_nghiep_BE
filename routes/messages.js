const express = require("express");
const { getMessage, createMessage } = require("../controllers/messagesController");
const router = express.Router();

router.route("/").get(getMessage).post(createMessage);

module.exports = router;
