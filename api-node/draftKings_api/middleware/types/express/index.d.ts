// eslint-disable-next-line @typescript-eslint/no-unused-vars
//index.d.ts es específico para la validación JWT y autenticación. Para Jugadores y Comentarios, los obtendrías a través de endpoints normales, no anexándolos al Request.
import { DecodedIdToken } from "firebase-admin/auth";
import type { IUser } from "../models/user"; // Importar desde el modelo donde se infiere el tipo

declare global {
  namespace Express {
    export interface Request {
      /**
       * El documento del usuario de la base de datos local (Mongoose),
       * verificado y adjuntado por el middleware de autorización.
       */
      user?: IUser;
      /**
       * El token decodificado de Firebase, con el UID y todos los claims.
       * Adjuntado por el middleware de autorización.
       */
      firebaseUser?: DecodedIdToken;
      /** Indica si el usuario es nuevo (no existía en la base de datos local antes de esta solicitud).
       * Esto se establece en el middleware de autorización después de verificar el token y buscar/crear el usuario.
       */
      isNewUser?: boolean;
    }
  }
}
