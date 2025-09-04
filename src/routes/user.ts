import express from "express";
import {
  getUserProfile,
  login,
  logout,
  userRegister,
} from "../controllers/user";
import { isAuthenticated } from "../middlewares/auth";

const router = express.Router();

// User registration route
router.post("/register", userRegister);
//login
router.post("/login", login);
//logout
router.post("/logout", logout);

//get Profile
router.get("/profile", isAuthenticated, getUserProfile);

export default router;
