const User = require("../models/userModel");

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const { status } = req.query;
        const filter =
            status === "active"
                ? { active: true }
                : status === "inactive"
                  ? { active: false }
                  : {};

        const users = await User.find(filter);
        res.status(200).json({
            status: "success",
            results: users.length,
            data: { users },
        });
    } catch (err) {
        res.status(400).json({ status: "fail", message: err.message });
    }
};

// Get a single user by ID
exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res
                .status(404)
                .json({ status: "fail", message: "User not found" });
        }
        res.status(200).json({ status: "success", data: { user } });
    } catch (err) {
        res.status(400).json({ status: "fail", message: err.message });
    }
};

// Create a new user
exports.createUser = async (req, res) => {
    try {
        const newUser = await User.create(req.body);
        res.status(201).json({ status: "success", data: { user: newUser } });
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err.message,
            error: err.name,
        });
    }
};

// Update a user
exports.updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!user) {
            return res
                .status(404)
                .json({ status: "fail", message: "User not found" });
        }
        res.status(200).json({ status: "success", data: { user } });
    } catch (err) {
        res.status(400).json({ status: "fail", message: err.message });
    }
};

// Delete a user
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res
                .status(404)
                .json({ status: "fail", message: "User not found" });
        }
        res.status(204).json({ status: "success", data: null });
    } catch (err) {
        res.status(400).json({ status: "fail", message: err.message });
    }
};

// Returns the currently logged-in user's data
exports.getMe = (req, res) => {
    res.status(200).json({
        status: "success",
        data: { user: req.user },
    });
};

// Lets user update their data
exports.updateMe = async (req, res) => {
    try {
        const allowedFields = { name: req.body.name, email: req.body.email };
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            allowedFields,
            // adds the updated user to the DB instead
            { new: true, runValidators: true }
        );

        res.status(200).json({
            status: "success",
            data: {
                user: updatedUser,
            },
        });
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err.message,
        });
    }
};

// Deletes or deactivates current user
exports.deleteMe = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user.id, { active: false });
        res.status(204).json({
            status: "success",
            data: null,
        });
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err.message,
        });
    }
};
