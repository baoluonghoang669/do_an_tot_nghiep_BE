const asyncHandler = require("../middleware/async");
const Message = require("../models/Message");

//@desc Get Message
//@route Get /api/v1/messages
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
//@route Post /api/v1/messages
//@access Public
exports.createMessage = asyncHandler(async (req, res, next) => {
  const message = await Message.create(req.body);

  res.status(201).json({
    success: true,
    data: message,
  });
});

//@desc Update a Message
//@route Put /api/v1/messages/:id
//@access Private
exports.updateMessage = asyncHandler(async (req, res, next) => {
  let messages = await Message.findById(req.params.id);

  if (!messages) {
    return next(
      new ErrorResponse(
        `No messages found with the id of ${req.params.id}`,
        404
      )
    );
  }

  messages = await Message.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: messages,
  });
});

//@desc Delete
//@route Delete /api/v1/messages/:id
//@access Private
exports.deleteMessage = asyncHandler(async (req, res, next) => {
  const message = await Message.findById(req.params.id);

  if (!message) {
    return next(
      new ErrorResponse(`No message found with the id of ${req.params.id}`, 404)
    );
  }

  await message.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});
