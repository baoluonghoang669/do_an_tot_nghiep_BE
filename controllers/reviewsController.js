const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Review = require("../models/Review");
const Project = require("../models/Project");
const ExcelJs = require("exceljs");
const readXlsxFile = require("read-excel-file/node");
//@desc Get all reviews
//@route Get /api/v1/reviews
//@route Get /api/v1/projects/:projectId/reviews
//@access Private
exports.getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.projectId) {
    const reviews = await Review.find({
      project: req.params.projectId,
    }).populate({
      path: "user",
      select: "name email",
    });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

//@desc Get single review
//@route Get /api/v1/reviews/:id
//@access Private
exports.getReview = asyncHandler(async (req, res, next) => {
  const reviews = await Review.findById(req.params.id).populate({
    path: "project",
    select: "name description",
  });

  if (!reviews) {
    return next(
      new ErrorResponse(`No review found with the id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews,
  });
});

//@desc Add review
//@route Post /api/v1/project/:projectId/reviews
//@access Private
exports.addReview = asyncHandler(async (req, res, next) => {
  req.body.project = req.params.projectId;
  req.body.user = req.user.id;

  const project = await Project.findById(req.params.projectId);

  if (!project) {
    return next(
      new ErrorResponse(
        `No Project found with the id of ${req.params.projectId}`,
        404
      )
    );
  }

  const reviews = await Review.create(req.body);

  res.status(200).json({
    success: true,
    data: reviews,
  });
});

//@desc Update review
//@route Put /api/v1/reviews/:id
//@access Private
exports.updateReview = asyncHandler(async (req, res, next) => {
  let reviews = await Review.findById(req.params.id);

  if (!reviews) {
    return next(
      new ErrorResponse(`No review found with the id of ${req.params.id}`, 404)
    );
  }

  //Make sure review belongs to user or user is an admin
  if (reviews.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse(`Not authorized to update review`, 401));
  }

  reviews = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: reviews,
  });
});

//@desc Delete
//@route Delete /api/v1/reviews/:id
//@access Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const reviews = await Review.findById(req.params.id);

  if (!reviews) {
    return next(
      new ErrorResponse(`No review found with the id of ${req.params.id}`, 404)
    );
  }

  //Make sure review belongs to user or user is an admin
  if (reviews.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse(`Not authorized to delete review`, 401));
  }

  await reviews.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});

//@desc Export excel
//@route Get /api/v1/reviews/export
//@access Private
exports.exportAllExcels = asyncHandler(async (req, res, next) => {
  try {
    const reviews = await Review.find();
    const workbook = new ExcelJs.Workbook();
    const worksheet = workbook.addWorksheet("My Reviews");
    worksheet.columns = [
      { header: "_id", key: "_id", width: 25 },
      { header: "comment", key: "comment", width: 25 },
      { header: "rating", key: "rating", width: 25 },
      { header: "project", key: "project", width: 25 },
      { header: "user", key: "user", width: 25 },
      { header: "createdAt", key: "createdAt", width: 25 },
    ];
    reviews.forEach((review) => {
      worksheet.addRow(review);
    });
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });
    await workbook.xlsx.writeFile(
      `${process.env.FILE_UPLOAD_PATH}/reviews.xlsx`
    );
    res.download(`${process.env.FILE_UPLOAD_PATH}/reviews.xlsx`);
  } catch (e) {
    res.status(500).send(e);
  }
});

//@desc Export excel
//@route Get /api/v1/reviews/export/:id
//@access Private
exports.exportExcel = asyncHandler(async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return next(
        new ErrorResponse(`Review not found with id of ${req.params.id}`),
        404
      );
    }
    const workbook = new ExcelJs.Workbook();
    const worksheet = workbook.addWorksheet(`Review_${req.params.id}`);
    worksheet.columns = [
      { header: "_id", key: "_id", width: 25 },
      { header: "comment", key: "comment", width: 25 },
      { header: "rating", key: "rating", width: 25 },
      { header: "project", key: "project", width: 25 },
      { header: "createdAt", key: "createdAt", width: 25 },
    ];
    worksheet.addRow(review);
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });
    await workbook.xlsx.writeFile(
      `${process.env.FILE_UPLOAD_PATH}/review_${req.params.id}.xlsx`
    );
    return res.download(
      `${process.env.FILE_UPLOAD_PATH}/review_${req.params.id}.xlsx`
    );
  } catch (e) {
    res.status(500).send(e);
  }
});
//@desc Import excel
//@route Post /api/v1/reviews/import
//@access Private
exports.importExcel = asyncHandler(async (req, res, next) => {
  const reviews = await Review.find();
  try {
    if (req.files == undefined) {
      res.status(400).json({
        message: "Please upload an excel file!",
      });
    }

    let path = process.env.FILE_UPLOAD_PATH + "/" + req.files.file.name;
    readXlsxFile(path).then((rows) => {
      // skip header
      rows.shift();
      // let tutorials = [];

      rows.forEach((row) => {
        let tutorial = {
          _id: row[0],
          comment: row[1],
          rating: row[2],
          project: row[3],
          user: row[4],
          createdAt: row[5],
        };
        reviews.push(tutorial);
      });
      Review.create(reviews)
        .then(() => {
          res.status(200).json({
            success: true,
            message: "Import successfully",
            data: reviews,
          });
        })
        .catch((error) => {
          res.status(500).send({
            message: "Fail to import data into database!",
            error: error.message,
          });
        });
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Could not upload the file: " + req.files.file.name,
    });
  }
});
