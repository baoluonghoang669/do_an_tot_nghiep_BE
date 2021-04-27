const path = require("path");
const Project = require("../models/Project");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Category = require("../models/Category");
const ExcelJs = require("exceljs");
const readXlsxFile = require("read-excel-file/node");

//@desc Get all projects
//@route Get /api/v1/projects
//@route Get /api/v1/categories/:categoriesId/projects
//@access Public

exports.getProjects = asyncHandler(async(req, res, next) => {
    const { name, description, cost, address, area } = req.query;
    if (req.params.categoriesId) {
        const project = await Project.find({
            categories: req.params.categoriesId,
        }).populate({
            path: "projects",
        });

        return res.status(200).json({
            success: true,
            count: project.length,
            data: project,
        });
    } else if (name || description || cost || address) {
        if (name) {
            const data = await Project.find({
                name: { $regex: name, $options: "$si" },
            });
            res.status(200).json({
                success: true,
                count: data.length,
                data: data,
            });
        }
        if (description) {
            const data = await Project.find({
                description: { $regex: description, $options: "$si" },
            });
            res.status(200).json({
                success: true,
                count: data.length,
                data: data,
            });
        }
        // if (categories) {
        //     const data = await Project.find({});
        //     res.status(200).json({
        //         success: true,
        //         count: data.length,
        //         data: data,
        //     });
        // }
        if (cost) {
            const data = await Project.find({
                cost: { $gt: 1, $lt: 1000000000 },
            });
            res.status(200).json({
                success: true,
                count: data.length,
                data: data,
            });
        }
        if (address) {
            const data = await Project.find({
                address: { $regex: address, $options: "$si" },
            });
            res.status(200).json({
                success: true,
                count: data.length,
                data: data,
            });
        }
        if (area) {
            const data = await Project.find({
                area: { $gt: 1, $lt: 1000000000 },
            });
            res.status(200).json({
                success: true,
                count: data.length,
                data: data,
            });
        }
    } else {
        res.status(200).json(res.advancedResults);

        //   const project = await Project.find({}).populate({
        //     path: "categories",
        //   });
        //   res.status(200).json({
        //     success: true,
        //     count: project.length,
        //     data: project,
        //   });
    }
});

//@desc Get single project
//@route Get /api/v1/projects/:id
//@access Public
exports.getProject = asyncHandler(async(req, res, next) => {
    const project = await Project.findById(req.params.id).populate({
        path: "categories",
    });

    if (!project) {
        return next(
            new ErrorResponse(`Project not found with id of ${req.params.id}`),
            404
        );
    }

    res.status(200).json({
        success: true,
        data: project,
    });
});

//@desc Add a new project
//@route Post /api/v1/categories/:categoriesId/projects
//@access Private
exports.createProject = asyncHandler(async(req, res, next) => {
    req.body.categories = req.params.categoriesId;

    const category = await Category.findById(req.params.categoriesId);

    if (!category) {
        return next(
            new ErrorResponse(
                `No category with the id of ${req.params.categoriesId}`
            ),
            404
        );
    }

    const project = await Project.create(req.body);

    res.status(200).json({
        success: true,
        data: project,
    });
});

//@desc Update project
//@route Put /api/v1/projects/:id
//@access Private
exports.updateProject = asyncHandler(async(req, res, next) => {
    let project = await Project.findById(req.params.id);

    if (!project) {
        return next(
            new ErrorResponse(`Project not found with id of ${req.params.id}`),
            404
        );
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        data: project,
    });
});

//@desc Delete project
//@route Delete /api/v1/projects/:id
//@access Private
exports.deleteProject = asyncHandler(async(req, res, next) => {
    const project = await Project.findById(req.params.id);

    if (!project) {
        return next(
            new ErrorResponse(`Project not found with id of ${req.params.id}`),
            404
        );
    }

    await project.remove();

    res.status(200).json({
        success: true,
        data: {},
    });
});

//@desc Upload photo for project
//@route PUT /api/v1/projects/:id/photo
//@access Private
exports.projectPhotoUpload = asyncHandler(async(req, res, next) => {
    const project = await Project.findById(req.params.id);

    if (!project) {
        return next(
            new ErrorResponse(`Project not found with id of ${req.params.id}`),
            404
        );
    }

    if (!req.files) {
        return next(new ErrorResponse(`Please upload a file`), 404);
    }

    const file = req.files.file;

    if (!file.mimetype.startsWith("image")) {
        return next(new ErrorResponse(`Please upload an image file`), 404);
    }

    //check filesize
    if (file.size > process.env.MAX_FILE_UPLOAD) {
        return next(
            new ErrorResponse(
                `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`
            ),
            404
        );
    }

    //Create custom filename
    file.name = `photo_${project._id}${path.parse(file.name).ext}`;

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async(err) => {
        if (err) {
            console.log(err);
            return next(new ErrorResponse(`Problem with upload file`), 500);
        }

        await Project.findByIdAndUpdate(req.params.id, { photo: file.name });

        res.status(200).json({
            success: true,
            data: process.env.BASE_URL_PUBLIC + file.name,
        });
    });
});

//@desc Export excel
//@route Get /api/v1/projects/export
//@access Private
exports.exportAllExcels = asyncHandler(async(req, res, next) => {
    try {
        const projects = await Project.find();
        const workbook = new ExcelJs.Workbook();
        const worksheet = workbook.addWorksheet("My Projects");
        worksheet.columns = [
            { header: "Name", key: "name", width: 30 },
            { header: "Image", key: "photo", width: 30 },
            { header: "Description", key: "description", width: 50 },
            { header: "Categories", key: "categories", width: 30 },
            { header: "Architecture", key: "architecture", width: 30 },
            { header: "Client", key: "client", width: 30 },
            { header: "Cost", key: "cost", width: 30 },
            { header: "Area", key: "area", width: 30 },
        ];
        projects.forEach((project) => {
            worksheet.addRow(project);
        });
        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true };
        });
        await workbook.xlsx.writeFile(
            `${process.env.FILE_UPLOAD_PATH}/projects.xlsx`
        );
        res.download(`${process.env.FILE_UPLOAD_PATH}/projects.xlsx`);
    } catch (e) {
        res.status(500).send(e);
    }
});

//@desc Export excel
//@route Get /api/v1/projects/export/:id
//@access Private
exports.exportExcel = asyncHandler(async(req, res, next) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return next(
                new ErrorResponse(`Project not found with id of ${req.params.id}`),
                404
            );
        }
        const workbook = new ExcelJs.Workbook();
        const worksheet = workbook.addWorksheet(`Project_${req.params.id}`);
        worksheet.columns = [
            { header: "Name", key: "name", width: 30 },
            { header: "Image", key: "photo", width: 30 },
            { header: "Description", key: "description", width: 50 },
            { header: "Categories", key: "categories", width: 30 },
            { header: "Architecture", key: "architecture", width: 30 },
            { header: "Client", key: "client", width: 30 },
            { header: "Cost", key: "cost", width: 30 },
            { header: "Area", key: "area", width: 30 },
        ];
        worksheet.addRow(project);
        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true };
        });
        await workbook.xlsx.writeFile(
            `${process.env.FILE_UPLOAD_PATH}/project_${req.params.id}.xlsx`
        );
        return res.download(
            `${process.env.FILE_UPLOAD_PATH}/project_${req.params.id}.xlsx`
        );
    } catch (e) {
        res.status(500).send(e);
    }
});

//@desc Import excel
//@route Post /api/v1/projects/import
//@access Private
exports.importExcel = asyncHandler(async(req, res, next) => {
    const projects = await Project.find();
    try {
        let path = process.env.FILE_UPLOAD_PATH + "/" + req.files.file.name;
        readXlsxFile(path).then((rows) => {
            rows.shift();
            let newTutorial = [];
            rows.forEach((row) => {
                let tutorial = {
                    name: row[0],
                    photo: row[1],
                    description: row[2],
                    categories: row[3],
                    architecture: row[4],
                    client: row[5],
                    cost: row[6],
                    area: row[7],
                    location: row[8],
                };
                newTutorial.push(tutorial);
            });
            for (let i = 0; i < newTutorial.length; i++) {
                projects.push(newTutorial[i]);
            }
            Project.create(projects)
                .then(() => {
                    res.status(200).json({
                        success: true,
                        message: "Import successfully",
                        data: projects,
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
            message: "Could not upload the file: ",
        });
    }
});