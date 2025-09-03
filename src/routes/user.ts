import express from "express";
import { login, logout, userRegister } from "../controllers/user";

const router = express.Router();

// User registration route
router.post("/register", userRegister);
//login
router.post("/login", login);
//logout
router.post("/logout", logout);

export default router;
