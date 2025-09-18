import express from "express";
import {
  changePassword,
  getUserProfile,
  login,
  logout,
  updateProfile,
  userRegister,
} from "../controllers/user";
import { isAuthenticated } from "../middlewares/auth";
import { singleAvatar } from "../uploads/multer";

const router = express.Router();

// User registration route
router.post("/register", userRegister);
//login
router.post("/login", login);
//logout
router.post("/logout", logout);

//get Profile
router.get("/profile", isAuthenticated, getUserProfile);

//update profile
router.put("/update-profile", isAuthenticated, singleAvatar, updateProfile);
//change password
router.put("/change-password", isAuthenticated, changePassword);

export default router;
