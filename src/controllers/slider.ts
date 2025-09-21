//create slider
import cloudinary from "cloudinary";
import sharp from "sharp";
import { tryCatchAsyncHandler } from "../helpers/tryCatchAsyncHandler";
import Slider from "../models/slider";
import { sliderStreamUpload } from "../uploads/fileConverter";
import ErrorHandler from "../utils/errorHandler";
import { sendResponse } from "../utils/response";
import { slideSchema } from "../validators/sliderValidation";

//create Slider
export const createSlider = tryCatchAsyncHandler(async (req, res, next) => {
  const { error, value } = slideSchema.validate(req.body);
  if (error) return next(new ErrorHandler(error.details[0].message, 400));

  let sliderImg = undefined;

  if (req.file) {
    try {
      // Convert uploaded image buffer to optimized WebP
      const webpBuffer = await sharp(req.file.buffer)
        .webp({ quality: 80 })
        .toBuffer();

      // Upload to Cloudinary
      const result = await sliderStreamUpload(webpBuffer);

      sliderImg = {
        public_id: result.public_id,
        secure_url: result.secure_url,
      };
    } catch (error) {
      return next(new ErrorHandler("Error uploading slider image.", 500));
    }
  }

  const slide = await Slider.create({
    ...value,
    sliderImg,
  });

  sendResponse(res, {
    success: true,
    message: "Slider created successfully",
    data: slide,
    statusCode: 201,
  });
});

//get all Slider
export const allViewSlider = tryCatchAsyncHandler(async (req, res, next) => {
  const sliders = await Slider.find();
  if (!sliders) {
    return next(new ErrorHandler("No slider found", 404));
  }

  sendResponse(res, {
    success: true,
    message: "Slider fetch successfully",
    data: sliders,
    statusCode: 200,
  });
});

//single Slider
export const singleSlider = tryCatchAsyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Find existing slide
  const slide = await Slider.findById(id);
  if (!slide) return next(new ErrorHandler("Slider not found", 404));

  sendResponse(res, {
    success: true,
    message: "Slider fetch successfully",
    data: slide,
    statusCode: 200,
  });
});

// update Slider
export const updateSlider = tryCatchAsyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { error, value } = slideSchema.validate(req.body);
  if (error) return next(new ErrorHandler(error.details[0].message, 400));

  // Find existing slide
  const slide = await Slider.findById(id);
  if (!slide) return next(new ErrorHandler("Slider not found", 404));

  let sliderImg = slide.sliderImg;

  if (req.file) {
    try {
      // Destroy old image if exists
      if (slide.sliderImg?.public_id) {
        await cloudinary.v2.uploader.destroy(slide.sliderImg.public_id);
      }

      // Convert to WebP and upload
      const webpBuffer = await sharp(req.file.buffer)
        .webp({ quality: 80 })
        .toBuffer();

      const result = await sliderStreamUpload(webpBuffer);

      sliderImg = {
        public_id: result.public_id,
        secure_url: result.secure_url,
      };
    } catch (error) {
      return next(new ErrorHandler("Error uploading slider image.", 500));
    }
  }

  // Update fields
  slide.title = value.title ?? slide.title;
  slide.subtitle = value.subtitle ?? slide.subtitle;
  slide.description = value.description ?? slide.description;
  slide.buttonText = value.buttonText ?? slide.buttonText;
  slide.buttonColor = value.buttonColor ?? slide.buttonColor;
  slide.overlay = value.overlay ?? slide.overlay;
  slide.sliderImg = sliderImg;

  await slide.save();

  sendResponse(res, {
    success: true,
    message: "Slider updated successfully",
    data: slide,
    statusCode: 200,
  });
});

//deleteSlider
export const deleteSlider = tryCatchAsyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Find existing slide
  const slide = await Slider.findById(id);
  if (!slide) return next(new ErrorHandler("Slider not found", 404));

  try {
    // Destroy old image if exists
    if (slide.sliderImg?.public_id) {
      await cloudinary.v2.uploader.destroy(slide.sliderImg.public_id);
    }

    // Delete the slide document
    await slide.deleteOne();

    sendResponse(res, {
      success: true,
      message: "Slider deleted successfully",
      statusCode: 200,
    });
  } catch (error) {
    return next(new ErrorHandler("Error deleting slider.", 500));
  }
});
