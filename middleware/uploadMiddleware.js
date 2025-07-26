const multer = require("multer");
const path = require("path");

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) cb(null, true);
    else cb(new Error("Not an image! Only image files are allowed."), false);
};

// modular storage for any folder name, used for users and events
const createStorage = (folderName) =>
    multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, path.join(__dirname, `../uploads/${folderName}`));
        },
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            cb(null, `${Date.now()}-${file.fieldname}${ext}`);
        },
    });

exports.uploadEventPhoto = multer({
    storage: createStorage("events"),
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 },
});

exports.uploadUserPhoto = multer({
    storage: createStorage("users"),
    fileFilter,
    limits: { fileSize: 1 * 1024 * 1024 },
});
