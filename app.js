const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const globalErrorHandler = require("./middleware/errorMiddleware");

const userRouter = require("./routes/userRoutes");
const eventRouter = require("./routes/eventRoutes");
const AppError = require("./utils/appError");

const app = express();

app.use(helmet());

// Body parser middleware
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

// Limit requests from same API
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: "Too many requests from this IP, please try again in an hour",
    standardHeaders: true,
    legacyHeaders: false,
});
app.use("/api", limiter);

// ROUTES
app.use("/api/v1/users", userRouter);
app.use("/api/v1/events", eventRouter);

app.all("*", (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
