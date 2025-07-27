const AppError = require("../utils/appError");
const catchAsync = require("./catchAsync");

// Implementing reusable CRUD handlers for all models
exports.getOne = (Model, popOptions) => {
    return catchAsync(async (req, res, next) => {
        const document = popOptions
            ? await Model.findById(req.params.id).populate(popOptions)
            : await Model.findById(req.params.id);

        if (!document) {
            return next(new AppError("No document found with that ID", 404));
        }

        res.status(200).json({
            status: "success",
            data: document,
        });
    });
};

exports.getAll = (Model) =>
    catchAsync(async (req, res, next) => {
        // 1. Filtering
        const queryObj = { ...req.query };
        const excludedFields = ["page", "sort", "limit", "fields"];
        excludedFields.forEach((el) => delete queryObj[el]);

        // Advanced filtering (e.g., ?price[gte]=10)
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(
            /\b(gte|gt|lte|lt)\b/g,
            (match) => `$${match}`
        );

        let query = Model.find(JSON.parse(queryStr));

        // 2. Sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(",").join(" ");
            query = query.sort(sortBy);
        } else {
            query = query.sort("-createdAt");
        }

        // 3. Field limiting
        if (req.query.fields) {
            const fields = req.query.fields.split(",").join(" ");
            query = query.select(fields);
        } else {
            query = query.select("-__v");
        }

        // 4. Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 100;
        const skip = (page - 1) * limit;

        query = query.skip(skip).limit(limit);

        const docs = await query;

        res.status(200).json({
            status: "success",
            results: docs.length,
            data: { data: docs },
        });
    });

exports.createOne = (Model, createdBy = false) =>
    catchAsync(async (req, res, next) => {
        if (req.file) {
            req.body.photo = req.file.filename;
        }

        if (createdBy) req.body.createdBy = req.user.id;

        const document = await Model.create(req.body);

        res.status(201).json({
            status: "success",
            data: document,
        });
    });

exports.updateOne = (Model, allowedFields) =>
    catchAsync(async (req, res, next) => {
        const document = await Model.findByIdAndUpdate(
            req.params.id,
            allowedFields || req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!document) {
            return next(new AppError("No document found with that ID", 404));
        }

        res.status(200).json({
            status: "success",
            data: document,
        });
    });

// pass in the softDelete option for user and admin deletion
exports.deleteOne = (Model, softDelete = false) =>
    catchAsync(async (req, res, next) => {
        const document = softDelete
            ? await Model.findByIdAndUpdate(req.user.id, {
                  active: false,
              })
            : await Model.findByIdAndDelete(req.user.id);

        if (!document) {
            return next(new AppError("No document found with that ID", 404));
        }

        res.status(204).json({
            status: "success",
        });
    });
