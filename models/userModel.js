const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please tell us your name"],
    },
    email: {
        type: String,
        required: [true, "Please provide your email address"],
        unique: true,
        lowercase: true,
    },
    photo: {
        type: String,
        default: "default.jpg",
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    password: {
        type: String,
        required: [true, "Please provide a password"],
        minLength: 8,
        select: false,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
    },
});

// virtually setting the confirmPassword field
userSchema
    .virtual("confirmPassword")
    .set(function (value) {
        this._confirmPassword = value;
    })
    .get(function () {
        return this._confirmPassword;
    });

// comparing the password and confirmPassword
userSchema.pre("save", function (next) {
    if (
        this.isModified("password") &&
        this.password !== this._confirmPassword
    ) {
        return next(new Error("Passwords do not match!"));
    }
    next();
});

// hashing the password
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 12);

    next();
});

// updating passwordChangedAt before saving the user
userSchema.pre("save", function (next) {
    if (!this.isModified("password") || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
});

// comparing the hashed passwords for login
userSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

// invalidating JWTs after password changes
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        );
        return JWTTimestamp < changedTimestamp;
    }

    return false;
};

// password reset token for resetting user passwords (send to users via email)
userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString("hex");

    this.passwordResetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
