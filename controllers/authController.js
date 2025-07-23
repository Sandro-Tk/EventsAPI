const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const crypto = require("crypto");

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

exports.signup = async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;

        const newUser = await User.create({
            name,
            email,
            password,
            confirmPassword,
        });

        createSendToken(newUser, 201, res);
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err.message,
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({
                status: "fail",
                message: "Email and Password required",
            });

        const user = await User.findOne({ email }).select("+password +active");

        if (!user || !(await user.correctPassword(password, user.password))) {
            return res
                .status(401)
                .json({ status: "fail", message: "Invalid credentials" });
        }

        if (!user.active) {
            return res.status(401).json({
                status: "fail",
                message: "Your account has been deactivated!",
            });
        }

        createSendToken(user, 200, res);
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};

// Allows logged-in users to change their password
exports.updateMyPassword = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("+password");

        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!(await user.correctPassword(currentPassword, user.password))) {
            return res.status(401).json({
                status: "fail",
                message: "Current password is incorrect",
            });
        }

        user.password = newPassword;
        user.confirmPassword = confirmPassword;
        await user.save();

        createSendToken(user, 200, res);
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
};

// Sends password reset token to user
exports.forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user)
            return res.status(404).json({
                status: "fail",
                message: "No user found with this email",
            });

        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false });

        const resetURL = `${req.protocol}://${req.get("host")}/api/users/resetPassword/${resetToken}`;

        // TODO: send resetURL via email
        console.log("Password reset URL:", resetURL);

        res.status(200).json({
            status: "success",
            message: "Token sent to email",
        });
    } catch (err) {
        res.status(500).json({
            status: "fail",
            message: "Error resetting password",
        });
    }
};

// Allows user to set new password using the reset token
exports.resetPassword = async (req, res) => {
    try {
        const hashedToken = crypto
            .createHash("sha256")
            .update(req.params.token)
            .digest("hex");

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() },
        });

        if (!user)
            return res.status(400).json({
                status: "fail",
                message: "Token is invalid or expired",
            });

        user.password = req.body.password;
        user.confirmPassword = req.body.confirmPassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        createSendToken(user, 200, res);
    } catch (err) {
        res.status(400).json({ status: "fail", message: err.message });
    }
};

// Only possible in frontend by deleting the jwt token
exports.logout = (req, res) => {
    res.cookie("jwt", "loggedout", {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });
    res.status(200).json({ status: "success" });
};
