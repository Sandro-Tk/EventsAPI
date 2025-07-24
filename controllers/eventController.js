const Event = require("../models/eventModel");
const path = require("path");
const fs = require("fs");

exports.getAllEvents = async (req, res) => {
    try {
        const events = await Event.find();

        res.status(200).json({
            status: "success",
            results: events.length,
            data: events,
        });
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err.message,
        });
    }
};

exports.getEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event)
            return res.status(404).json({
                status: "fail",
                message: "Event Could not be found",
            });

        res.status(200).json({
            status: "success",
            data: event,
        });
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err.message,
        });
    }
};

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

exports.createEvent = async (req, res) => {
    try {
        if (req.file) {
            req.body.photo = req.file.filename;
        }

        req.body.createdBy = req.user.id;
        const event = await Event.create(req.body);

        res.status(201).json({ status: "success", data: { event } });
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err.message,
            error: err.name,
        });
    }
};

exports.updateEvent = async (req, res) => {
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
                    "../uploads",
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

        const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({ status: "success", data: { event } });
    } catch (err) {
        res.status(400).json({ status: "fail", message: err.message });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res
                .status(404)
                .json({ status: "fail", message: "Event not found" });
        }

        if (event.photo !== "default.jpg") {
            const imagePath = path.join(__dirname, "../uploads", event.photo);
            fs.unlink(imagePath, (err) => {
                if (err)
                    console.warn("Failed to delete event photo:", err.message);
            });
        }

        await Event.findByIdAndDelete(req.params.id);
        res.status(204).json({ status: "success", data: null });
    } catch (err) {
        res.status(400).json({ status: "fail", message: err.message });
    }
};
