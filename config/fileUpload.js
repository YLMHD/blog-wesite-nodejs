const multer = require("multer");

const upload = multer({
  limits: 800000,
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "/public/uploads");
    },
    filename: (req, file, cb) => {
      cb(null, (Date.now() + "_" + file.originalname));
    },
  }),

  fileFilter: (req, file, cb) => {
    const allowedFileType = ["jpg", "jpeg", "png"];
    if (allowedFileType.includes(file.mimetype.split("/")[1])) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});

module.exports = upload;
