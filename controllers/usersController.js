const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const ExcelJs = require("exceljs");

//@desc Get all users
//@route Get /api/v1/users
//@access Private
exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

//@desc Get single user
//@route Get /api/v1/users
//@access Private
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`),
      404
    );
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

//@desc Create a new user
//@route Post /api/v1/users
//@access Private
exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  res.status(201).json({
    success: true,
    data: user,
  });
});

//@desc Update user
//@route Put /api/v1/users/:id
//@access Private
exports.updateUser = asyncHandler(async (req, res, next) => {
  let user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`),
      404
    );
  }

  user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

//@desc Delete user
//@route Delete /api/v1/users/:id
//@access Private
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`),
      404
    );
  }

  await user.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});

//@desc Import excel
//@route Post /api/v1/users/import
//@access Private
exports.importExcel = asyncHandler(async (req, res, next) => {});

//@desc Export excel
//@route Get /api/v1/users/export
//@access Private
exports.exportAllExcels = asyncHandler(async (req, res, next) => {
  try {
    const users = await User.find();
    const workbook = new ExcelJs.Workbook();
    const worksheet = workbook.addWorksheet("My Users");
    worksheet.columns = [
      { header: "_id", key: "_id", width: 20 },
      { header: "name", key: "name", width: 20 },
      { header: "email", key: "email", width: 20 },
      { header: "birthday", key: "birthday", width: 20 },
      { header: "city", key: "city", width: 20 },
      { header: "province", key: "province", width: 20 },
      { header: "address", key: "address", width: 20 },
      { header: "phone", key: "phone", width: 20 },
      { header: "avatar", key: "avatar", width: 20 },
      { header: "role", key: "role", width: 20 },
      { header: "password", key: "password", width: 20 },
    ];
    users.forEach((user) => {
      worksheet.addRow(user);
    });
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });
    await workbook.xlsx.writeFile(`${process.env.FILE_UPLOAD_PATH}/users.xlsx`);
    res.download(`${process.env.FILE_UPLOAD_PATH}/users.xlsx`);
  } catch (e) {
    res.status(500).send(e);
  }
});
//@desc Export excel
//@route Get /api/v1/users/export/:id
//@access Private
exports.exportExcel = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(
        new ErrorResponse(`User not found with id of ${req.params.id}`),
        404
      );
    }
    const workbook = new ExcelJs.Workbook();
    const worksheet = workbook.addWorksheet(`User_${req.params.id}`);
    worksheet.columns = [
      { header: "_id", key: "_id", width: 20 },
      { header: "name", key: "name", width: 20 },
      { header: "email", key: "email", width: 20 },
      { header: "birthday", key: "birthday", width: 20 },
      { header: "city", key: "city", width: 20 },
      { header: "province", key: "province", width: 20 },
      { header: "address", key: "address", width: 20 },
      { header: "phone", key: "phone", width: 20 },
      { header: "avatar", key: "avatar", width: 20 },
      { header: "role", key: "role", width: 20 },
      { header: "password", key: "password", width: 20 },
    ];
    worksheet.addRow(user);
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });
    await workbook.xlsx.writeFile(
      `${process.env.FILE_UPLOAD_PATH}/user_${req.params.id}.xlsx`
    );
    return res.download(
      `${process.env.FILE_UPLOAD_PATH}/user_${req.params.id}.xlsx`
    );
  } catch (e) {
    res.status(500).send(e);
  }
});
