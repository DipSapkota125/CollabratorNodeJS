import multer from "multer";

const multerUpload = multer({
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  storage: multer.memoryStorage(),
});

const singleAvatar = multerUpload.single("avatar");
const singleSliderUpload = multerUpload.single("sliderImg");
const attachmentsMulter = multerUpload.array("files", 5);

export { attachmentsMulter, singleAvatar, singleSliderUpload };
