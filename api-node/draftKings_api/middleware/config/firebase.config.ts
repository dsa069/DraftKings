import * as admin from "firebase-admin";

let rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;

if (rawServiceAccount) {
  // 1. Quitar comillas simples si las tuviera en los extremos
  if (rawServiceAccount.startsWith("'") && rawServiceAccount.endsWith("'")) {
    rawServiceAccount = rawServiceAccount.slice(1, -1);
  }

  // 2. SANITIZACIÓN: Reemplazar saltos de línea reales por caracteres escapados '\\n'.
  // Esto evita el error "Bad control character" en JSON.parse
  rawServiceAccount = rawServiceAccount
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
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
