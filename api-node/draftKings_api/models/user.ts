import { Schema, InferSchemaType, model } from "mongoose";

const userSchema = new Schema(
  {
    firebaseUid: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    userName: { type: String, required: false },
    role: { type: String, default: "usuario" },
    is_active: { type: Boolean, default: true },
    blocked: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// ✅ TypeScript infiere automáticamente el tipo del schema
type IUser = InferSchemaType<typeof userSchema>;

export const User = model<IUser>("User", userSchema);
