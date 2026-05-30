import * as admin from "firebase-admin";

let rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;

// Si la variable viene envuelta en comillas simples ('), se las quitamos.
if (
  rawServiceAccount &&
  rawServiceAccount.startsWith('"') &&
  rawServiceAccount.endsWith('"')
) {
  rawServiceAccount = rawServiceAccount.slice(1, -1);
}

const serviceAccount = rawServiceAccount
  ? JSON.parse(rawServiceAccount)
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
