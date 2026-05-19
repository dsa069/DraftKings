// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { DecodedIdToken } from "firebase-admin/auth";
import { IUser } from "../user.types"; // Asegúrate que la ruta es correcta

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
    }
  }
}
