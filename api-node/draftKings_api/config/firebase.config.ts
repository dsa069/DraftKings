import * as admin from "firebase-admin";

// Lee las credenciales de la variable de entorno (más seguro para producción)
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : undefined;

if (!serviceAccount) {
  console.error(
    "Credenciales de Firebase no encontradas. Asegúrate de definir la variable de entorno FIREBASE_SERVICE_ACCOUNT.",
  );
  // En un entorno de producción, podrías querer que la aplicación falle al iniciar.
  // process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const authAdmin = admin.auth();
