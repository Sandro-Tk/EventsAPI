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

const router = express.Router();

router.get("/", getAllEvents);

router.use(protect);
router.get("/myEvents", getMyEvents);
router.patch("/:id/attend", restrictTo("user"), attendEvent);

router.get("/:id", getEvent);

router.use(restrictTo("admin"));
router.post("/createEvent", createEvent);
router.route("/:id").patch(updateEvent).delete(deleteEvent);

module.exports = router;
