const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse").default;
const asyncHandler = require("../middleware/async");
const ExcelJs = require("exceljs");
const readXlsxFile = require("read-excel-file/node");
const moment = require("moment");

//@desc Get all users
//@route Get /api/v1/users
//@access Private
exports.getUsers = asyncHandler(async(req, res, next) => {
    const { name, email, phone, address, birthday, city } = req.query;
    if (name || email || phone || address || birthday || city) {
        if (name) {
            const data = await User.find({
                name: { $regex: name, $options: "$si" },
            });
            res.status(200).json({
                success: true,
                totalCount: data.length,
                data: data,
            });
        }
        if (email) {
            const data = await User.find({
                email: { $regex: email, $options: "$si" },
            });
            res.status(200).json({
                success: true,
                totalCount: data.length,
                data: data,
            });
        }
        if (address) {
            const data = await User.find({
                address: { $regex: address, $options: "$si" },
            });
            res.status(200).json({
                success: true,
                totalCount: data.length,
                data: data,
            });
        }
        if (birthday) {
            const date = new Date(birthday);
            const today = date.toLocaleDateString(`fr-CA`).split("/").join("-");
            var start = moment().startOf("day");
            var end = moment(today).endOf("day");
            const data = await User.find({
                birthday: {
                    $gte: start,
                    $lte: end,
                },
            });
            res.status(200).json({
                success: true,
                totalCount: data.length,
                data: data,
            });
        }
        if (city) {
            const data = await User.find({
                city: { $regex: city, $options: "$si" },
            });
            res.status(200).json({
                success: true,
                totalCount: data.length,
                data: data,
            });
        }
        if (phone) {
            const data = await User.find({
                phone: { $regex: phone, $options: "$si" },
            });
            res.status(200).json({
                success: true,
                totalCount: data.length,
                data: data,
            });
        }
    } else {
        res.status(200).json(res.advancedResults);
    }
});

//@desc Get single user
//@route Get /api/v1/users
//@access Private
exports.getUser = asyncHandler(async(req, res, next) => {
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
exports.createUser = asyncHandler(async(req, res, next) => {
    const user = await User.create(req.body);

    res.status(201).json({
        success: true,
        data: user,
    });
});

//@desc Update user
//@route Put /api/v1/users/:id
//@access Private
exports.updateUser = asyncHandler(async(req, res, next) => {
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
exports.deleteUser = asyncHandler(async(req, res, next) => {
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

//@desc Export excel
//@route Get /api/v1/users/export
//@access Private
exports.exportAllExcels = asyncHandler(async(req, res, next) => {
    try {
        const users = await User.find();
        const workbook = new ExcelJs.Workbook();
        const worksheet = workbook.addWorksheet("My Users");
        worksheet.columns = [
            { header: "name", key: "name", width: 20 },
            { header: "email", key: "email", width: 20 },
            { header: "birthday", key: "birthday", width: 20 },
            { header: "city", key: "city", width: 20 },
            { header: "province", key: "province", width: 20 },
            { header: "address", key: "address", width: 20 },
            { header: "phone", key: "phone", width: 20 },
            { header: "role", key: "role", width: 20 },
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
exports.exportExcel = asyncHandler(async(req, res, next) => {
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
            { header: "name", key: "name", width: 20 },
            { header: "email", key: "email", width: 20 },
            { header: "birthday", key: "birthday", width: 20 },
            { header: "city", key: "city", width: 20 },
            { header: "province", key: "province", width: 20 },
            { header: "address", key: "address", width: 20 },
            { header: "phone", key: "phone", width: 20 },
            { header: "role", key: "role", width: 20 },
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

//@desc Import excel
//@route Post /api/v1/users/import
//@access Private
exports.importExcel = asyncHandler(async(req, res, next) => {
    const users = await User.find();
    try {
        let path = process.env.FILE_UPLOAD_PATH + "/" + req.files.file.name;
        readXlsxFile(path).then((rows) => {
            rows.shift();
            let newTutorial = [];
            rows.forEach((row) => {
                let tutorial = {
                    name: row[0],
                    email: row[1],
                    birthday: row[2],
                    city: row[3],
                    province: row[4],
                    address: row[5],
                    phone: row[6],
                    avatar: row[7],
                    avatar: row[8],
                    role: row[9],
                };
                newTutorial.push(tutorial);
            });
            for (let i = 0; i < newTutorial.length; i++) {
                users.push(newTutorial[i]);
            }
            User.create(users)
                .then(() => {
                    res.status(200).json({
                        success: true,
                        message: "Import successfully",
                        data: users,
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