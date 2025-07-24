const express = require("express");
const {
    getAllEvents,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    getMyEvents,
    attendEvent,
} = require("../controllers/eventController");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/", getAllEvents);

router.use(protect);
router.get("/myEvents", getMyEvents);
router.patch("/:id/attend", restrictTo("user"), attendEvent);
router.get("/:id", getEvent);

router.post(
    "/createEvent",
    protect,
    restrictTo("admin"),
    upload.single("photo"),
    createEvent
);
router
    .route("/:id")
    .patch(protect, restrictTo("admin"), upload.single("photo"), updateEvent)
    .delete(protect, restrictTo("admin"), deleteEvent);

module.exports = router;
