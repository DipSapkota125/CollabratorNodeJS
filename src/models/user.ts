// user.ts
import bcrypt from "bcryptjs";
import { Document, Model, model, Schema } from "mongoose";

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  role?: "user" | "admin";
  address?: string;
  avatar?: {
    public_id: string;
    secure_url: string;
  };
  mobile?: string;
  gender?: string;
  date_of_birth?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;

  // instance methods
  isPasswordMatched(enteredPassword: string): Promise<boolean>;
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
      select: false,
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
      public_id: { type: String },
      secure_url: { type: String },
    },

    mobile: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: false,
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

//hashed Password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.isPasswordMatched = async function (
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

// 3. Create and export the model
export const User: Model<IUser> = model<IUser>("User", userSchema);
