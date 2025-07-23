const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");

exports.protect = async (req, res, next) => {
    try {
        let token;
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token)
            return res
                .status(401)
                .json({ status: "fail", message: "Not logged in" });

        const decoded = await promisify(jwt.verify)(
            token,
            process.env.JWT_SECRET
        );

        const currentUser = await User.findById(decoded.id);
        if (!currentUser)
            return res
                .status(401)
                .json({ status: "fail", message: "User no longer exists" });

        if (currentUser.changedPasswordAfter(decoded.iat))
            return res
                .status(401)
                .json({ status: "fail", message: "Password changed recently" });

        req.user = currentUser;
        next();
    } catch (err) {
        res.status(401).json({ status: "fail", message: "Invalid token" });
    }
};

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res
                .status(403)
                .json({
                    status: "fail",
                    message:
                        "You don't have the permission to perform this action.",
                });
        }
        next();
    };
};
