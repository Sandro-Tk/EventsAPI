const fs = require("fs");
const path = require("path");

// used to delete a photo file from the uploads folder if its not the default
exports.deletePhoto = (folder, photoFilename) => {
    if (photoFilename && photoFilename !== "default.jpg") {
        const imagePath = path.join(
            __dirname,
            `../uploads/${folder}`,
            photoFilename
        );
        fs.unlink(imagePath, (err) => {
            if (err)
                console.warn(`Failed to delete ${folder} photo:`, err.message);
        });
    }
};
