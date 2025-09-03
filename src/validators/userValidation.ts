import Joi from "joi";

// Define validation schema
export const createUserSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .pattern(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=[\\]{};':\"\\\\|,.<>/?]).{8,}$"
      )
    )
    .required()
    .messages({
      "string.pattern.base":
        "Password must be at least 8 characters long, include uppercase, lowercase, number, and special character",
      "string.empty": "Password is required",
    }),
  role: Joi.string().valid("user", "admin").optional(),
  address: Joi.string().max(200).optional(),
  avatar: Joi.string().uri().optional(),
  gender: Joi.string().valid("male", "female", "other").optional(),
  date_of_birth: Joi.date().optional(),
  mobile: Joi.string()
    .pattern(/^[0-9]+$/)
    .optional(),
  isActive: Joi.boolean().optional(),
  isVerified: Joi.boolean().optional(),
});
