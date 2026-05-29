import { Request, Response } from "express";
import mongoose from "mongoose";
import Review from "../models/review";
import Player from "../models/player"; // IMPORTANTE: Importamos Player para validar si existe

// 10) Obtener comentarios de un jugador
export const reviewsGetByPlayer = async (req: Request, res: Response) => {
  try {
    let id = req.params.id as string | string[] | undefined;
    if (Array.isArray(id)) id = id[0];
    if (!id) return res.status(400).json({ message: "Bad Request" });

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ message: "Identificador de jugador inválido" });
    }

    // 1. Validar que el jugador existe para cumplir con el 404 Not Found
    const playerExists = await Player.findById(id).exec();
    if (!playerExists) {
      return res.status(404).json({ message: "Jugador no encontrado" });
    }

    const reviews = await Review.find({ player: id }).exec();
    return res.status(200).json(reviews);
  } catch (err: any) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
};

// 11) Crear un comentario para un jugador
export const reviewsCreate = async (req: Request, res: Response) => {
  try {
    let playerId = req.params.id as string | string[] | undefined;
    if (Array.isArray(playerId)) playerId = playerId[0];
    if (!playerId) return res.status(400).json({ message: "Bad Request" });

    if (!mongoose.Types.ObjectId.isValid(playerId)) {
      return res
        .status(400)
        .json({ message: "Identificador de jugador inválido" });
    }

    const { author, text, rating, latitude, longitude } = req.body;

    // 2. Validación de campos requeridos (400 Bad Request)
    if (!text || rating === undefined) {
      return res.status(400).json({
        message:
          "Body de la reseña inválido o incompleto. Se requiere text y rating.",
      });
    }

    // Validar que el jugador existe antes de asociar el comentario
    const playerExists = await Player.findById(playerId).exec();
    if (!playerExists) {
      return res.status(404).json({ message: "Jugador no encontrado" });
    }

    // Extraer userId desde el request (el middleware autorizeRequest inyecta esto)
    // Si por algún motivo no estuviera, usamos el default (aunque el endpoint debe estar protegido)
    const userId = req.user ? req.user._id : new mongoose.Types.ObjectId();
    const finalAuthor =
      author || (req.user && req.user.userName ? req.user.userName : "Anónimo");

    const newReview = new Review({
      user: userId,
      player: playerId,
      author: finalAuthor,
      text,
      rating,
      coords: {
        type: "Point",
        coordinates: [Number(longitude || 0), Number(latitude || 0)],
      },
    });

    const savedReview = await newReview.save();
    return res.status(201).json(savedReview);
  } catch (err: any) {
    // 3. Simular el 503 Service Unavailable si la BD de Mongoose pierde conexión/timeout
    if (
      err.name === "MongooseError" ||
      err.message.includes("timeout") ||
      err.name === "MongoNetworkError"
    ) {
      return res
        .status(503)
        .json({ message: "Servicio de reseñas no disponible" });
    }
    return res
      .status(500)
      .json({ message: "Error interno inesperado", error: err.message });
  }
};

// 12) Editar comentario
export const reviewsUpdate = async (req: Request, res: Response) => {
  try {
    let id = req.params.id as string | string[] | undefined;
    if (Array.isArray(id)) id = id[0];
    if (!id) return res.status(400).json({ message: "Bad Request" });

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Review ID" });
    }

    const { text, rating } = req.body;

    // 4. Validación de Body (400 Bad Request)
    // Si no manda ni text ni rating, no hay nada que actualizar.
    if (text === undefined && rating === undefined) {
      return res.status(400).json({ message: "Body de la reseña inválido" });
    }

    const updatedReview = await Review.findByIdAndUpdate(
      id,
      {
        $set: {
          ...(text !== undefined && { text }),
          ...(rating !== undefined && { rating }),
        },
      },
      { new: true },
    ).exec();

    if (!updatedReview) {
      return res.status(404).json({ message: "Comentario no existe" });
    }

    return res.status(200).json(updatedReview);
  } catch (err: any) {
    return res
      .status(500)
      .json({ message: "Error interno inesperado", error: err.message });
  }
};

// 13) Eliminar comentario
export const reviewsDelete = async (req: Request, res: Response) => {
  try {
    let id = req.params.id as string | string[] | undefined;
    if (Array.isArray(id)) id = id[0];
    if (!id) return res.status(400).json({ message: "Bad Request" });

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Review ID" });
    }

    const deletedReview = await Review.findByIdAndDelete(id).exec();

    if (!deletedReview) {
      return res.status(404).json({ message: "Comentario no existe" });
    }

    return res.status(204).send();
  } catch (err: any) {
    return res
      .status(500)
      .json({ message: "Error interno inesperado", error: err.message });
  }
};
