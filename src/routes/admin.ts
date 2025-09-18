import express from "express";
import {
  allUsers,
  deleteUsers,
  manageRolePermission,
  viewUserDetails,
} from "../controllers/admin";
import { isAuthAdmin, isAuthenticated } from "../middlewares/auth";

const router = express.Router();

//update role
router.put(
  "/update-role/:id",
  isAuthenticated,
  isAuthAdmin,
  manageRolePermission
);

//all-Users
router.get("/all-users", isAuthenticated, isAuthAdmin, allUsers);
//view-User-Details
router.get(
  "/single-user-details/:id",
  isAuthenticated,
  isAuthAdmin,
  viewUserDetails
);

//delete-users
router.delete("/delete-users", isAuthenticated, isAuthAdmin, deleteUsers);

export default router;
