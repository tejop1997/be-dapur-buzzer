import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const { Schema, model, models } = mongoose;
const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      index: true,
    },
  },
  { versionKey: false, timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = function (plain: string) {
  return bcrypt.compare(plain, this.password);
};

export type UserDoc = {
  _id: string;
  email: string;
  password: string;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
  comparePassword: (plain: string) => Promise<boolean>;
};

export const User = (models.User as any) || model<UserDoc>("User", UserSchema);
