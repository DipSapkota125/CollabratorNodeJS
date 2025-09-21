import { Document, Schema, model } from "mongoose";

export interface ISlide extends Document {
  sliderImg?: {
    public_id: string;
    secure_url: string;
  };
  title: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
  buttonColor?: string;
  overlay?: string;
  createdAt: Date;
  updatedAt: Date;
}

const sliderSchema = new Schema<ISlide>(
  {
    sliderImg: {
      public_id: { type: String },
      secure_url: { type: String },
    },
    title: { type: String, required: true },
    subtitle: { type: String },
    description: { type: String },
    buttonText: { type: String },
    buttonColor: { type: String },
    overlay: { type: String },
  },
  { timestamps: true }
);

export default model<ISlide>("Slider", sliderSchema);
