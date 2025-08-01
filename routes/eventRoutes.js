const express = require("express");
const {
    getAllEvents,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    getMyEvents,
    attendEvent,
    unattendEvent,
} = require("../controllers/eventController");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const { uploadEventPhoto } = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/", getAllEvents);

router.use(protect);
router.get("/myEvents", getMyEvents);
router.patch("/:id/attend", restrictTo("user"), attendEvent);
router.patch("/:id/unattend", restrictTo("user"), unattendEvent);
router.get("/:id", getEvent);

router.post(
    "/createEvent",
    protect,
    restrictTo("admin"),
    uploadEventPhoto.single("photo"),
    createEvent
);
router
    .route("/:id")
    .patch(
        protect,
        restrictTo("admin"),
        uploadEventPhoto.single("photo"),
        updateEvent
    )
    .delete(protect, restrictTo("admin"), deleteEvent);

module.exports = router;
