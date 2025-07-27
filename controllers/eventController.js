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
const catchAsync = require("../utils/catchAsync");

exports.getAllEvents = getAll(Event);
exports.getEvent = getOne(Event);
exports.createEvent = createOne(Event, true);

exports.getMyEvents = catchAsync(async (req, res, next) => {
    const events = await Event.find({ attendees: req.user.id });

    if (events.length === 0)
        return next(new AppError("You haven't booked any events yet", 404));

    res.status(200).json({
        status: "success",
        data: events,
    });
});

exports.unattendEvent = catchAsync(async (req, res, next) => {
    const event = await Event.findById(req.params.id);

    if (!event) {
        return next(new AppError("Event not found", 404));
    }

    if (!event.attendees.includes(req.user.id)) {
        return next(new AppError("You aren't attending this event", 400));
    }

    event.attendees.pull(req.user.id);

    await event.save();

    res.status(200).json({
        status: "success",
        message: "You've successfully unattended to this event.",
    });
});

exports.attendEvent = catchAsync(async (req, res, next) => {
    const event = await Event.findById(req.params.id);

    if (!event) {
        return next(new AppError("Event not found", 404));
    }

    if (event.attendees.includes(req.user.id))
        return next(new AppError("Already attending this event", 400));

    if (
        event.maxParticipants &&
        event.attendees.length >= event.maxParticipants
    ) {
        return next(new AppError("Event is fully booked", 400));
    }

    event.attendees.push(req.user.id);
    // save the changes to the event
    await event.save();

    res.status(200).json({
        status: "success",
        message: "You've successfully RSVPed to this event.",
    });
});

exports.updateEvent = catchAsync(async (req, res, next) => {
    const curEvent = await Event.findById(req.params.id);

    if (!curEvent) {
        return next(new AppError("Event not found", 404));
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
                    console.warn("Failed to delete old photo:", err.message);
            });
        }
    }

    return updateOne(Event)(req, res, next);
});

exports.deleteEvent = catchAsync(async (req, res, next) => {
    const event = await Event.findById(req.params.id);

    if (!event) {
        return next(new AppError("Event not found", 404));
    }

    if (event.photo !== "default.jpg") {
        const imagePath = path.join(
            __dirname,
            "../uploads/events",
            event.photo
        );
        fs.unlink(imagePath, (err) => {
            if (err) console.warn("Failed to delete event photo:", err.message);
        });
    }

    return deleteOne(Event)(req, res, next);
});
