import * as admin from "firebase-admin";

let rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;

if (rawServiceAccount) {
  // 1. Quitar comillas simples si las tuviera en los extremos
  if (rawServiceAccount.startsWith("'") && rawServiceAccount.endsWith("'")) {
    rawServiceAccount = rawServiceAccount.slice(1, -1);
  }

  // 2. SANITIZACIÓN QUIRÚRGICA: Buscamos únicamente el valor de "private_key"
  // y reemplazamos los saltos de línea reales por caracteres escapados (\\n).
  // Esto arregla el error "Bad control character" sin alterar el resto del JSON.
  rawServiceAccount = rawServiceAccount.replace(
    /("private_key"\s*:\s*")([\s\S]*?)(")/,
    (match, openQuote, keyContent, closeQuote) => {
      const cleanKey = keyContent.replace(/\n/g, "\\n").replace(/\r/g, "\\r");
      return openQuote + cleanKey + closeQuote;
    },
  );
}

const serviceAccount = rawServiceAccount
  ? JSON.parse(rawServiceAccount)
  : undefined;

if (!serviceAccount) {
  console.error(
    "Credenciales de Firebase no encontradas. Asegúrate de definir la variable de entorno FIREBASE_SERVICE_ACCOUNT.",
  );
} else {
  // 3. CONTROL PARA JEST: Evita que falle diciendo "Firebase App named [DEFAULT] already exists"
  // al ejecutar múltiples archivos de test en paralelo.
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
}

export const authAdmin = admin.auth();
