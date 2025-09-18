import cloudinary from "cloudinary";
import { tryCatchAsyncHandler } from "../helpers/tryCatchAsyncHandler";
import { User } from "../models/user";
import ErrorHandler from "../utils/errorHandler";
import { paginate } from "../utils/paginate";
import { sendResponse } from "../utils/response";

// update Role By admin Only
export const manageRolePermission = tryCatchAsyncHandler(
  async (req, res, next) => {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    const { email, mobile, role, isActive } = req.body;

    if (email) user.email = email;
    if (mobile) user.mobile = mobile;
    if (role) user.role = role;
    if (typeof isActive !== "undefined") user.isActive = isActive;

    await user.save();

    sendResponse(res, {
      success: true,
      message: "User role/permission updated successfully",
      data: user,
      statusCode: 200,
    });
  }
);

// Get all users except admin with pagination
export const allUsers = tryCatchAsyncHandler(async (req, res, next) => {
  const { results: users, pagination } = await paginate(
    User,
    { role: { $ne: "admin" } },
    {
      page: req.query.page as string,
      limit: req.query.limit as string,
      select: "-password",
      sort: { createdAt: -1 },
    }
  );
  sendResponse(res, {
    success: true,
    message: "all Users fetch successFully",
    data: users,
    statusCode: 200,
    pagination,
  });
});

//get User Details By Id(admin)
export const viewUserDetails = tryCatchAsyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) {
    return next(new ErrorHandler("user not found", 404));
  }

  sendResponse(res, {
    success: true,
    message: "all User fetch successFully",
    data: user,
    statusCode: 200,
  });
});

//deleteUser(multiple or single from body array of id)
export const deleteUsers = tryCatchAsyncHandler(async (req, res, next) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return next(new ErrorHandler("Please provide at least one user id", 400));
  }

  // 1. Find users first
  const users = await User.find({ _id: { $in: ids } });

  if (users.length === 0) {
    return next(new ErrorHandler("No users found for the given ids", 404));
  }

  // 2. Delete avatars from Cloudinary if exist
  for (const user of users) {
    if (user.avatar?.public_id) {
      try {
        await cloudinary.v2.uploader.destroy(user.avatar.public_id);
      } catch (err) {
        console.error(`Failed to delete avatar for user ${user._id}:`, err);
      }
    }
  }

  // 3. Delete users from DB
  const result = await User.deleteMany({ _id: { $in: ids } });

  sendResponse(res, {
    success: true,
    message: `${result.deletedCount} user(s) deleted successfully`,
    statusCode: 200,
  });
});

// update role and isActive for multiple users at once
export const multipleUpdateRoleIsActive = tryCatchAsyncHandler(
  async (req, res, next) => {
    const { ids, role, isActive } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return next(new ErrorHandler("Please provide at least one user id", 400));
    }

    if (typeof role === "undefined" && typeof isActive === "undefined") {
      return next(
        new ErrorHandler("Please provide role or isActive to update", 400)
      );
    }

    // Prepare update object
    const updateData: Record<string, any> = {};
    if (role) updateData.role = role;
    if (typeof isActive !== "undefined") updateData.isActive = isActive;

    // Bulk update
    const result = await User.updateMany(
      { _id: { $in: ids } },
      { $set: updateData }
    );

    sendResponse(res, {
      success: true,
      message: `${result.modifiedCount} user(s) updated successfully`,
      statusCode: 200,
    });
  }
);
