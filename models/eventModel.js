const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Events must have a name"],
    },
    date: {
        type: Date,
    },
    description: {
        type: String,
    },
    maxParticipants: Number,
    createdBy: {
        // Points to the admin who created the event
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    // location: {
    //     type: {
    //         type: String,
    //         enum: ["Point"],
    //         default: "Point",
    //     },
    //     coordinates: [Number], // [longitude, latitude]
    //     address: String,
    //     city: String,
    //     country: String,
    // },
    photo: {
        type: String,
        default: "default.jpg",
    },
    price: {
        // if price is nullish, 0 or empty, then display free entry
        type: Number,
    },
});

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
