import Joi from "joi";

// Create / Update slide validation
export const slideSchema = Joi.object({
  sliderImg: Joi.object({
    public_id: Joi.string().optional(),
    secure_url: Joi.string().uri().optional(),
  }).optional(),
  title: Joi.string().trim().required().messages({
    "any.required": "Title is required",
    "string.empty": "Title cannot be empty",
  }),
  subtitle: Joi.string().trim().optional(),
  description: Joi.string().trim().optional(),
  buttonText: Joi.string().trim().optional(),
  buttonColor: Joi.string().trim().optional(),
  overlay: Joi.string().trim().optional(),
});
