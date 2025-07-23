const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    event: {
        type: mongoose.Schema.ObjectId,
        ref: "Event",
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// dont let user book same event twice
bookingSchema.index({ user: 1, event: 1 }, { unique: true });

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
