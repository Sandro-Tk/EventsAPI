const express = require("express");

const {
    getAllUsers,
    createUser,
    getUser,
    updateUser,
    deleteUser,
    getMe,
    updateMe,
    deleteMe,
} = require("../controllers/userController");
const {
    login,
    signup,
    logout,
    forgotPassword,
    resetPassword,
    updateMyPassword,
} = require("../controllers/authController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", login);
router.post("/signup", signup);
router.get("/logout", logout);

router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);

// Protects the following routes
router.use(protect);

router.patch("/updateMyPassword", updateMyPassword);
router.get("/me", getMe);
router.patch("/updateMe", updateMe);
router.delete("/deleteMe", deleteMe);

// Only gives admins permission to perform the following actions
router.use(restrictTo("admin"));

router.route("/").get(getAllUsers).post(createUser);
router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
