const User = require("../models/userModel");
const fs = require("fs");
const path = require("path");
const {
    updateOne,
    deleteOne,
    getOne,
    getAll,
    createOne,
} = require("../utils/handlerFactory");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getUser = getOne(User);
exports.getAllUsers = getAll(User);
exports.createUser = createOne(User);
exports.deleteMe = deleteOne(User, true);

exports.updateUser = catchAsync(async (req, res, next) => {
    const curUser = await User.findById(req.params.id);
    if (!curUser) {
        return next(new AppError("User not found", 404));
    }

    if (req.file) {
        req.body.photo = req.file.filename;

        if (curUser.photo !== "default.jpg") {
            const oldPath = path.join(
                __dirname,
                "../uploads/users",
                curUser.photo
            );
            fs.unlink(oldPath, (err) => {
                if (err)
                    console.warn("Failed to delete old photo:", err.message);
            });
        }
    }

    return updateOne(User)(req, res, next);
});

exports.deleteUser = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new AppError("User not found", 404));
    }

    if (user.photo !== "default.jpg") {
        const imagePath = path.join(__dirname, "../uploads/users", user.photo);
        fs.unlink(imagePath, (err) => {
            if (err) console.warn("Failed to delete user photo:", err.message);
        });
    }

    return deleteOne(User)(req, res, next);
});

exports.getMe = (req, res) => {
    res.status(200).json({
        status: "success",
        data: { user: req.user },
    });
};

exports.updateMe = catchAsync(async (req, res, next) => {
    if (req.file) {
        req.body.photo = req.file.filename;
    }

    const user = await User.findById(req.user.id);

    if (!user) {
        return next(new AppError("User not found", 404));
    }

    if (req.file && user.photo !== "default.jpg") {
        const imagePath = path.join(__dirname, "../uploads/users", user.photo);
        fs.unlink(imagePath, (err) => {
            if (err) console.warn("Failed to delete user photo:", err.message);
        });
    }

    const allowedFields = {
        name: req.body.name,
        email: req.body.email,
        photo: req.body.photo,
    };

    // remove undefined fields if photo isnt specified
    Object.keys(allowedFields).forEach(
        (key) => allowedFields[key] === undefined && delete allowedFields[key]
    );

    return updateOne(User, allowedFields);
});
