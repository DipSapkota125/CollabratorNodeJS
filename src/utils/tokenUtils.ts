import jwt from "jsonwebtoken";
import { IUser } from "../models/user";

// Define return type for generateTokens
interface Tokens {
  accessToken: string;
  refreshToken: string;
}

// Generate tokens
export const generateTokens = (user: IUser): Tokens => {
  const accessToken = jwt.sign(
    { id: user._id.toString(), role: user.role as "user" | "admin" },
    process.env.JWT_ACCESS_SECRET as string,
    { expiresIn: "1d" }
  );

  const refreshToken = jwt.sign(
    { id: user._id.toString(), role: user.role as "user" | "admin" },
    process.env.JWT_REFRESH_SECRET as string,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};
