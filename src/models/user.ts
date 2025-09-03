// user.ts
import { Document, Model, model, Schema } from "mongoose";

// 1. Define a TypeScript interface for the User
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role?: "user" | "admin";
  address?: string;
  avatar?: string;
  mobile?: string;
  gender?: string;
  date_of_birth?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 2. Create the Mongoose schema
const userSchema: Schema<IUser> = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    gender: {
      type: String,
      trim: true,
    },
    date_of_birth: {
      type: String,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
    },
    mobile: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

// 3. Create and export the model
export const User: Model<IUser> = model<IUser>("User", userSchema);
