const Event = require("../models/eventModel");
const path = require("path");
const fs = require("fs");
const {
    updateOne,
    deleteOne,
    getAll,
    getOne,
    createOne,
} = require("../utils/handlerFactory");
const AppError = require("../utils/appError");

exports.getAllEvents = getAll(Event);
exports.getEvent = getOne(Event);
exports.createEvent = createOne(Event, true);

exports.getMyEvents = async (req, res) => {
    try {
        const events = await Event.find({ attendees: req.user.id });

        if (events.length === 0)
            return res.status(404).json({
                status: "fail",
                message: "You haven't booked any events yet",
            });

        res.status(200).json({
            status: "success",
            data: events,
        });
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err.message,
        });
    }
};

exports.attendEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                status: "fail",
                message: "Event not found",
            });
        }

        if (event.attendees.includes(req.user.id))
            return res.status(400).json({
                status: "fail",
                message: "Already attending this event",
            });

        if (
            event.maxParticipants &&
            event.attendees.length >= event.maxParticipants
        ) {
            return res.status(400).json({
                status: "fail",
                message: "Event is fully booked",
            });
        }

        event.attendees.push(req.user.id);
        // save the changes to the event
        await event.save();

        res.status(200).json({
            status: "success",
            message: "You've successfully RSVPed to this event.",
        });
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err.message,
        });
    }
};

exports.updateEvent = async (req, res, next) => {
    try {
        const curEvent = await Event.findById(req.params.id);

        if (!curEvent) {
            return res
                .status(404)
                .json({ status: "fail", message: "Event not found" });
        }

        if (req.file) {
            req.body.photo = req.file.filename;

            if (curEvent.photo !== "default.jpg") {
                const oldPath = path.join(
                    __dirname,
                    "../uploads/events",
                    curEvent.photo
                );
                fs.unlink(oldPath, (err) => {
                    if (err)
                        console.warn(
                            "Failed to delete old photo:",
                            err.message
                        );
                });
            }
        }

        return updateOne(Event)(req, res, next);
    } catch (err) {
        next(new AppError(err.message, 400));
    }
};

exports.deleteEvent = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res
                .status(404)
                .json({ status: "fail", message: "Event not found" });
        }

        if (event.photo !== "default.jpg") {
            const imagePath = path.join(
                __dirname,
                "../uploads/events",
                event.photo
            );
            fs.unlink(imagePath, (err) => {
                if (err)
                    console.warn("Failed to delete event photo:", err.message);
            });
        }

        return deleteOne(Event)(req, res, next);
    } catch (err) {
        next(new AppError(err.message, 400));
    }
};
