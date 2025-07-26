const AppError = require("../utils/appError");

// Handle invalid MongoDB ObjectId
const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};

// Handle duplicate key errors (e.g. email already exists)
const handleDuplicateFieldsDB = (err) => {
    const value = err.keyValue
        ? Object.values(err.keyValue)[0]
        : "Duplicate field value";
    const message = `Duplicate field value: '${value}'. Please use another value.`;
    return new AppError(message, 400);
};

// Handle validation errors from Mongoose schema
const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid input: ${errors.join(". ")}`;
    return new AppError(message, 400);
};

// Handle invalid JWT
const handleJWTError = () =>
    new AppError("Invalid token. Please log in again!", 401);

// Handle expired JWT
const handleJWTExpiredError = () =>
    new AppError("Your token has expired. Please log in again!", 401);

// Send full error in dev
const sendErrorDev = (err, res) => {
    res.status(err.statusCode || 500).json({
        status: err.status || "error",
        error: err,
        message: err.message,
        stack: err.stack,
    });
};

// Send minimal error in production
const sendErrorProd = (err, res) => {
    // Operational error (AppError)
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    }

    // Unknown or programming error
    console.error("ERROR 💥", err);
    res.status(500).json({
        status: "error",
        message: "Something went wrong!",
    });
};

// Global error handler
module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    if (process.env.NODE_ENV === "development") {
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV === "production") {
        let error = Object.create(err);

        if (error.name === "CastError") error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        if (error.name === "ValidationError")
            error = handleValidationErrorDB(error);
        if (error.name === "JsonWebTokenError") error = handleJWTError();
        if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

        sendErrorProd(error, res);
    }
};
