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
const { uploadUserPhoto } = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post("/login", login);
router.post("/signup", signup);
router.get("/logout", logout);

router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);

// Protects the following routes
router.use(protect);

router.get("/me", getMe);
router.patch("/updateMe", uploadUserPhoto.single("photo"), updateMe);
router.patch("/updateMyPassword", updateMyPassword);
router.delete("/deleteMe", deleteMe);

// Only gives admins permission to perform the following actions
router.use(restrictTo("admin"));

router
    .route("/")
    //  * GET /api/v1/users?status=active
    //  * Optional query: status = "active" | "inactive"
    //  * Returns filtered user list. Invalid values return 400.
    .get(getAllUsers)
    .post(uploadUserPhoto.single("photo"), createUser);
router
    .route("/:id")
    .get(getUser)
    .patch(uploadUserPhoto.single("photo"), updateUser)
    .delete(deleteUser);

module.exports = router;
