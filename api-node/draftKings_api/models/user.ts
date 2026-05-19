import { Schema, model } from "mongoose";
import { IUser } from "../types/user.types";

const UserSchema = new Schema<IUser>(
  {
    firebaseUid: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    userName: { type: String, required: false },
    role: { type: String, default: "usuario" }, // Soporte para control de roles del PDF (actividad 3.2)
    is_active: { type: Boolean, default: true },
    blocked: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const User = model<IUser>("User", UserSchema);
