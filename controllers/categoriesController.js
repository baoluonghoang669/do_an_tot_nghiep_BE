const Category = require("../models/Category");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const ExcelJs = require("exceljs");

//@desc Get all categories
//@route Get /api/v1/categories
//@access Public
exports.getCategories = asyncHandler(async(req, res, next) => {
    const { name, description } = req.query;
    if (name) {
        const data = await Category.find({
            name: { $regex: name, $options: "$si" },
        }).populate({
            path: "projects",
        });
        res.status(200).json({
            success: true,
            totalCount: data.length,
            data: data,
        });
    }
    if (description) {
        const data = await Category.find({
            description: { $regex: description, $options: "$si" },
        });
        res.status(200).json({
            success: true,
            totalCount: data.length,
            data: data,
        });
    }
    res.status(200).json(res.advancedResults);
});

//@desc Get single data
//@route Get /api/v1/categories/:id
//@access Public
exports.getCategory = asyncHandler(async(req, res, next) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
        return next(
            new ErrorResponse(`Category not found with id of ${req.params.id}`),
            404
        );
    }

    res.status(200).json({
        success: true,
        data: category,
    });
});

//@desc Create a new category
//@route Post /api/v1/categories
//@access Private
exports.createCategory = asyncHandler(async(req, res, next) => {
    const category = await Category.create(req.body);

    res.status(201).json({
        success: true,
        data: category,
    });
});

//@desc Update category
//@route Put /api/v1/categories/:id
//@access Private
exports.updateCategory = asyncHandler(async(req, res, next) => {
    let category = await Category.findById(req.params.id);

    if (!category) {
        return next(
            new ErrorResponse(`Category not found with id of ${req.params.id}`),
            404
        );
    }

    category = await Category.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        data: category,
    });
});

//@desc Delete category
//@route Delete /api/v1/categories/:id
//@access Private
exports.deleteCategory = asyncHandler(async(req, res, next) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
        return next(
            new ErrorResponse(`Category not found with id of ${req.params.id}`),
            404
        );
    }

    await category.remove();

    res.status(200).json({
        success: true,
        data: {},
    });
});

//@desc Export excel
//@route Get /api/v1/categories/export
//@access Private
exports.exportAllExcels = asyncHandler(async(req, res, next) => {
    try {
        const categories = await Category.find();
        const workbook = new ExcelJs.Workbook();
        const worksheet = workbook.addWorksheet("My Reviews");
        worksheet.columns = [
            { header: "_id", key: "_id", width: 25 },
            { header: "name", key: "name", width: 25 },
            { header: "image", key: "image", width: 25 },
            { header: "description", key: "description", width: 25 },
            { header: "createdAt", key: "createdAt", width: 25 },
        ];
        categories.forEach((category) => {
            worksheet.addRow(category);
        });
        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true };
        });
        await workbook.xlsx.writeFile(
            `${process.env.FILE_UPLOAD_PATH}/categories.xlsx`
        );
        res.download(`${process.env.FILE_UPLOAD_PATH}/categories.xlsx`);
    } catch (e) {
        res.status(500).send(e);
    }
});
//@desc Export excel
//@route Get /api/v1/categories/export/:id
//@access Private
exports.exportExcel = asyncHandler(async(req, res, next) => {
    try {
        const categories = await Category.findById(req.params.id);
        if (!categories) {
            return next(
                new ErrorResponse(`Category not found with id of ${req.params.id}`),
                404
            );
        }
        const workbook = new ExcelJs.Workbook();
        const worksheet = workbook.addWorksheet(`Review_${req.params.id}`);
        worksheet.columns = [
            { header: "_id", key: "_id", width: 25 },
            { header: "name", key: "name", width: 25 },
            { header: "image", key: "image", width: 25 },
            { header: "description", key: "description", width: 25 },
            { header: "createdAt", key: "createdAt", width: 25 },
        ];
        worksheet.addRow(categories);
        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true };
        });
        await workbook.xlsx.writeFile(
            `${process.env.FILE_UPLOAD_PATH}/category_${req.params.id}.xlsx`
        );
        return res.download(
            `${process.env.FILE_UPLOAD_PATH}/category_${req.params.id}.xlsx`
        );
    } catch (e) {
        res.status(500).send(e);
    }
});