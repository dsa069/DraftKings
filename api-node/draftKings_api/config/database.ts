import mongoose from "mongoose";

/**
 * Establece la conexión con la base de datos MongoDB.
 * Lee la URI de la variable de entorno BD_URI.
 */
export const connectDB = async () => {
  try {
    const mongoUri = process.env.BD_URI;

    if (!mongoUri) {
      console.error("Error: La variable de entorno BD_URI no está definida.");
      process.exit(1); // Detiene la aplicación si la URI no está configurada
    }

    await mongoose.connect(mongoUri);

    console.log("MongoDB conectado exitosamente.");
  } catch (error) {
    console.error("Error al conectar con MongoDB:", error);
    process.exit(1); // Detiene la aplicación si la conexión falla
  }
};
