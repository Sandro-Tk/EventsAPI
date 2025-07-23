const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Events must have a name"],
    },
    description: String,
    date: {
        type: Date,
        required: true,
    },
    maxParticipants: {
        type: Number,
        required: true,
    },
    // array of attendees
    attendees: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "User",
        },
    ],
    location: {
        address: {
            type: String,
            required: true,
        },
        city: String,
        country: String,
    },
    photo: {
        type: String,
        default: "default.jpg",
    },
    price: {
        // if price is nullish, 0 or empty, then display free entry
        type: Number,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    createdBy: {
        // Points to the admin who created the event
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
});

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
