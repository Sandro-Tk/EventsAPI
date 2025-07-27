const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const crypto = require("crypto");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const signToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
    };
    res.cookie("jwt", token, cookieOptions);

    // Remove the password from the output
    user.password = undefined;

    res.status(statusCode).json({
        status: "success",
        token,
        data: {
            user,
        },
    });
};

exports.signup = catchAsync(async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;

    const newUser = await User.create({
        name,
        email,
        password,
        confirmPassword,
    });

    createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password)
        return nextTick(new AppError("Email and Password required", 400));

    const user = await User.findOne({ email }).select("+password +active");

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError("Invalid credentials", 401));
    }

    if (!user.active) {
        return next(new AppError("Your account has been deactivated!", 401));
    }

    createSendToken(user, 200, res);
});

// Allows logged-in users to change their password
exports.updateMyPassword = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password");

    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!(await user.correctPassword(currentPassword, user.password))) {
        return next(new AppError("Current password is incorrect", 401));
    }

    user.password = newPassword;
    user.confirmPassword = confirmPassword;
    await user.save();

    createSendToken(user, 200, res);
});

// Sends password reset token to user
exports.forgotPassword = catchAsync(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return next(new AppError("No user found with this email", 404));

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get("host")}/api/users/resetPassword/${resetToken}`;

    // TODO: send resetURL via email
    console.log("Password reset URL:", resetURL);

    res.status(200).json({
        status: "success",
        message: "Token sent to email",
    });
});

// Allows user to set new password using the reset token
exports.resetPassword = catchAsync(async (req, res, next) => {
    const hashedToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) return next(new AppError("Token is invalid or expired", 400));

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    createSendToken(user, 200, res);
});

// Only possible in frontend by deleting the jwt token, unless i add an actual frontend
exports.logout = (req, res) => {
    res.cookie("jwt", "loggedout", {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });
    res.status(200).json({ status: "success" });
};
