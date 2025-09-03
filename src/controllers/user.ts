import { tryCatchAsyncHandler } from "../helpers/tryCatchAsyncHandler";
import { User } from "../models/user";
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
    return next(new ErrorHandler("Invalid credentials!", 400));
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
    message: "Login successful",
    data: {
      id: user._id,
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
