import mongoose from "mongoose";

/**
 * Establece la conexión con la base de datos MongoDB.
 * Lee la URI de la variable de entorno BD_URI.
 */
const dbURI = process.env.BD_URI || "";

if (!dbURI) {
  console.error("Error: La variable de entorno BD_URI no está definida.");
  process.exit(1);
}

// Opciones de conexión más robustas para entornos cloud
const options = {
  serverSelectionTimeoutMS: 5000,
  // Estas opciones ayudan a solucionar problemas de handshake SSL en entornos restringidos
  tls: true,
  tlsAllowInvalidCertificates: false, // Manténlo false por seguridad
};

mongoose
  .connect(dbURI, options) // <--- Agregamos las opciones aquí
  .then(() => {
    console.log(`Mongoose connected successfully`);
  })
  .catch((err) => {
    console.error("Mongoose initial connection error:", err);
  });

mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error:", err);
});
mongoose.connection.on("disconnected", () => {
  console.log("Mongoose disconnected");
});

// Graceful shutdown helper
const gracefulShutdown = (msg: string, callback: () => void) => {
  mongoose.connection
    .close()
    .then(() => {
      console.log(`Mongoose disconnected through ${msg}`);
      callback();
    })
    .catch((err) => {
      console.error("Error closing mongoose connection:", err);
      callback();
    });
};

//TO DO: Reemplazar nodemon
process.once("SIGUSR2", () => {
  gracefulShutdown("nodemon restart", () => {
    process.kill(process.pid, "SIGUSR2");
  });
});
process.on("SIGINT", () => {
  gracefulShutdown("app termination", () => {
    process.exit(0);
  });
});
process.on("SIGTERM", () => {
  gracefulShutdown("Heroku app shutdown", () => process.exit(0));
});

export default mongoose;
