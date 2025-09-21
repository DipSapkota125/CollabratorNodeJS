import express from "express";
import {
  allViewSlider,
  createSlider,
  deleteSlider,
  singleSlider,
  updateSlider,
} from "../controllers/slider";
import { isAuthAdmin, isAuthenticated } from "../middlewares/auth";
import { singleSliderUpload } from "../uploads/multer";

const router = express.Router();

//add slider
router.post(
  "/add-slider",
  isAuthenticated,
  isAuthAdmin,
  singleSliderUpload,
  createSlider
);

//update-slider
router.put(
  "/update-slider/:id",
  isAuthenticated,
  isAuthAdmin,
  singleSliderUpload,
  updateSlider
);

//delete-slider
router.delete("/delete-slider/:id", isAuthenticated, isAuthAdmin, deleteSlider);

//get all Slider
router.get("/all-view-slider", isAuthenticated, isAuthAdmin, allViewSlider);

//get single Slider
router.get("/view-slider/:id", isAuthenticated, isAuthAdmin, singleSlider);

export default router;
