import jwt from "jsonwebtoken";
import { tryCatchAsyncHandler } from "../helpers/tryCatchAsyncHandler";
import { User } from "../models/user";
import ErrorHandler from "../utils/errorHandler";

export const isAuthenticated = tryCatchAsyncHandler(async (req, res, next) => {
  const token =
    req.cookies.accessToken || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return next(
      new ErrorHandler("Authentication required. Please log in.", 401)
    );
  }

  try {
    const decodedData = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET as string
    ) as { id: string; role: "user" | "admin" };

    const user = await User.findById(decodedData.id);
    if (!user) {
      return next(
        new ErrorHandler("User not found. Please log in again.", 404)
      );
    }

    req.user = user;
    return next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
      });
      return next(
        new ErrorHandler("Session expired. Please log in again.", 401)
      );
    }

    return next(new ErrorHandler("Invalid token. Please log in again.", 401));
  }
});
