import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const SliderSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    imageData: { type: Schema.Types.Buffer, required: true },
    imageType: { type: String, required: true },
    link: { type: String },
    active: { type: Boolean, default: true, index: true },
  },
  { versionKey: false, timestamps: true }
);

export type SliderDoc = {
  _id: string;
  title: string;
  imageData: any;
  imageType: string;
  link?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export const Slider = (models.Slider as any) || model<SliderDoc>("Slider", SliderSchema);
