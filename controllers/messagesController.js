const asyncHandler = require("../middleware/async");
const Message = require("../models/Message");

//@desc Get Message
//@route Get /api/v1/auth/messages
//@access Public
exports.getMessage = asyncHandler(async (req, res, next) => {
  const message = await Message.find({});

  res.status(201).json({
    success: true,
    count: message.length,
    data: message,
  });
});

//@desc Create a new Message
//@route Post /api/v1/auth/messages
//@access Public
exports.createMessage = asyncHandler(async (req, res, next) => {
  const message = await Message.create(req.body);

  res.status(201).json({
    success: true,
    data: message,
  });
});
