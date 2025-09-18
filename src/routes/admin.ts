import express from "express";
import { manageRolePermission } from "../controllers/user";
import { isAuthAdmin, isAuthenticated } from "../middlewares/auth";

const router = express.Router();

//update role
router.put(
  "/update-role/:id",
  isAuthenticated,
  isAuthAdmin,
  manageRolePermission
);

export default router;
