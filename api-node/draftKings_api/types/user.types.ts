import { Document } from "mongoose";

/**
 * Interfaz que representa la estructura de un documento de Usuario en la base de datos.
 * Extiende de Document para incluir las propiedades de Mongoose (_id, timestamps, etc.).
 */
export interface IUser extends Document {
  firebaseUid: string;
  email: string;
  userName?: string;
  role: string;
  is_active: boolean;
  blocked: boolean;
}
