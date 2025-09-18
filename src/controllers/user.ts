import cloudinary from "cloudinary";
import sharp from "sharp";
import { tryCatchAsyncHandler } from "../helpers/tryCatchAsyncHandler";
import { User } from "../models/user";
import { AuthenticatedRequest } from "../types/express";
import { avatarStreamUpload } from "../uploads/fileConverter";
import ErrorHandler from "../utils/errorHandler";
import { sendResponse } from "../utils/response";
import { generateTokens } from "../utils/tokenUtils";
import {
  createUserSchema,
  loginValidation,
} from "../validators/userValidation";

//register
export const userRegister = tryCatchAsyncHandler(async (req, res, next) => {
  const { error } = createUserSchema.validate(req.body);
  if (error) return next(new ErrorHandler(error.details[0].message, 400));

  const userExists = await User.findOne({ email: req.body.email });
  if (userExists)
    return next(new ErrorHandler("Email already registered", 400));

  const user = new User(req.body);
  await user.save();

  // 4. Send standardized response
  sendResponse(res, {
    success: true,
    message: "User registered successfully",
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    statusCode: 201,
  });
});

//login
export const login = tryCatchAsyncHandler(async (req, res, next) => {
  const { error } = loginValidation.validate(req.body);
  if (error) return next(new ErrorHandler(error.details[0].message, 400));

  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user) return next(new ErrorHandler("Resource Not Found!", 404));

  const isPasswordMatched = await user.isPasswordMatched(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Credentials!", 400));
  }

  // 4. Generate tokens
  const { accessToken, refreshToken } = generateTokens(user);

  // Cookie options
  const cookieOptions: import("express").CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as "strict" | "lax" | "none",
  };

  // Set cookies
  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
  });
  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  sendResponse(res, {
    success: true,
    message: "Login Successful",
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token: { accessToken, refreshToken }, // now allowed
    statusCode: 200,
  });
});

export const logout = tryCatchAsyncHandler(async (req, res, next) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as "strict" | "lax" | "none",
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as "strict" | "lax" | "none",
  });

  // Send response
  sendResponse(res, {
    success: true,
    message: "Logout successful",
    statusCode: 200,
  });
});

//get profile
export const getUserProfile = tryCatchAsyncHandler<AuthenticatedRequest>(
  async (req, res, next) => {
    const user = await User.findById(req.user.id);
    if (!user) return next(new ErrorHandler("Resource Not Found!", 404));

    sendResponse(res, {
      success: true,
      message: "User profile fetched successfully",
      data: user,
      statusCode: 200,
    });
  }
);

//update Profile
export const updateProfile = tryCatchAsyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) return next(new ErrorHandler("Resource Not Found!", 404));

  const { name, gender, date_of_birth, address } = req.body;

  const updatedData: Record<string, any> = {
    ...(name && { name }),
    ...(gender && { gender }),
    ...(date_of_birth && { date_of_birth }),
    ...(address && { address }),
  };

  // ✅ Handle Cloudinary update if new file is uploaded
  if (req.file) {
    try {
      // Convert uploaded image buffer to optimized WebP
      const webpBuffer = await sharp(req.file.buffer)
        .webp({ quality: 80 })
        .toBuffer();

      // Upload to Cloudinary
      const result = await avatarStreamUpload(webpBuffer);

      // Add new avatar
      updatedData.avatar = {
        secure_url: result.secure_url,
        public_id: result.public_id,
      };

      // Delete old avatar if exists
      if (user.avatar?.public_id) {
        await cloudinary.v2.uploader.destroy(user.avatar.public_id);
      }
    } catch (error) {
      return next(new ErrorHandler("Error updating avatar image.", 500));
    }
  }

  // Update user with new data
  const updatedUser = await User.findByIdAndUpdate(user._id, updatedData, {
    new: true,
    runValidators: true,
  });

  if (!updatedUser) {
    return next(new ErrorHandler("User update failed!", 500));
  }

  sendResponse(res, {
    success: true,
    message: "Profile updated successfully",
    data: {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      mobile: updatedUser.mobile,
      gender: updatedUser.gender,
      date_of_birth: updatedUser.date_of_birth,
      address: updatedUser.address,
      avatar: updatedUser.avatar
        ? {
            public_id: updatedUser.avatar.public_id,
            secure_url: updatedUser.avatar.secure_url,
          }
        : null,
      role: updatedUser.role,
    },
    statusCode: 200,
  });
});

//change Password
export const changePassword = tryCatchAsyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");
  if (!user) return next(new ErrorHandler("Resource Not Found!", 404));

  const { oldPassword, newPassword, confirmPassword } = req.body;
  if (!oldPassword || !newPassword || !confirmPassword) {
    return next(new ErrorHandler("please enter all fields", 400));
  }

  if (newPassword !== confirmPassword) {
    return next(new ErrorHandler("password must be match", 400));
  }

  const isMatched = await user.isPasswordMatched(oldPassword);
  if (!isMatched) {
    return next(new ErrorHandler("olPassword is incorrect", 400));
  }

  user.password = newPassword;
  await user.save();
  sendResponse(res, {
    success: true,
    message: "Password updated successFully!",
    statusCode: 200,
  });
});

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

    res.status(200).json({
      success: true,
      message: "User role/permission updated successfully",
      user,
    });
  }
);
