const User = require("../models/userModel");
const {
    updateOne,
    deleteOne,
    getOne,
    getAll,
    createOne,
} = require("../utils/handlerFactory");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { deletePhoto } = require("../utils/fileUtils");

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
        deletePhoto("users", curUser.photo);
    }

    return updateOne(User)(req, res, next);
});

exports.deleteUser = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new AppError("User not found", 404));
    }

    deletePhoto("users", user.photo);

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

    if (req.file) {
        deletePhoto("users", user.photo);
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
