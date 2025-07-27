const express = require("express");
const morgan = require("morgan");
const globalErrorHandler = require("./middleware/errorMiddleware");

const userRouter = require("./routes/userRoutes");
const eventRouter = require("./routes/eventRoutes");
const AppError = require("./utils/appError");

const app = express();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

// ROUTES
app.use("/api/v1/users", userRouter);
app.use("/api/v1/events", eventRouter);

app.all("*", (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
