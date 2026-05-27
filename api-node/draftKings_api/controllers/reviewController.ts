// controllers/reviewController.ts
import { Request, Response } from "express";
import mongoose from "mongoose";
import Review from "../models/review";

// 10) Obtener comentarios de un jugador
export const reviewsGetByPlayer = async (req: Request, res: Response) => {
  try {
    // Sanitizamos el ID igual que en playerController
    let id = req.params.id as string | string[] | undefined;
    if (Array.isArray(id)) id = id[0];
    if (!id) return res.status(400).json({ message: "Bad Request" });

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Player ID" });
    }

    const reviews = await Review.find({ player: id }).exec();

    // Gracias a nuestro toJSON en el modelo, mongoose formatea el output mágicamente
    return res.status(200).json(reviews);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

// 11) Crear un comentario para un jugador
export const reviewsCreate = async (req: Request, res: Response) => {
  try {
    // Sanitizamos el ID
    let playerId = req.params.id as string | string[] | undefined;
    if (Array.isArray(playerId)) playerId = playerId[0];
    if (!playerId) return res.status(400).json({ message: "Bad Request" });

    const { author, text, rating, latitude, longitude } = req.body;

    if (!mongoose.Types.ObjectId.isValid(playerId)) {
      return res.status(400).json({ message: "Invalid Player ID" });
    }

    // Igual que en Spring: Si no hay usuario en la request (token), metemos uno mock temporal
    const userId =
      (req as any).user?.id ||
      new mongoose.Types.ObjectId("507f1f77bcf86cd799439011");

    const newReview = new Review({
      user: userId,
      player: playerId,
      author,
      text,
      rating,
      coords: {
        type: "Point",
        coordinates: [Number(longitude || 0), Number(latitude || 0)], // [lng, lat]
      },
    });

    const savedReview = await newReview.save();
    return res.status(201).json(savedReview);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

// 12) Editar comentario
export const reviewsUpdate = async (req: Request, res: Response) => {
  try {
    // Sanitizamos el ID
    let id = req.params.id as string | string[] | undefined;
    if (Array.isArray(id)) id = id[0];
    if (!id) return res.status(400).json({ message: "Bad Request" });

    const { text, rating } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Review ID" });
    }

    // Usamos findByIdAndUpdate para actualización parcial directa
    const updatedReview = await Review.findByIdAndUpdate(
      id,
      {
        $set: {
          ...(text !== undefined && { text }),
          ...(rating !== undefined && { rating }),
        },
      },
      { new: true }, // Devuelve el documento modificado
    ).exec();

    if (!updatedReview)
      return res.status(404).json({ message: "Review not found" });

    return res.status(200).json(updatedReview);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

// 13) Eliminar comentario
export const reviewsDelete = async (req: Request, res: Response) => {
  try {
    // Sanitizamos el ID
    let id = req.params.id as string | string[] | undefined;
    if (Array.isArray(id)) id = id[0];
    if (!id) return res.status(400).json({ message: "Bad Request" });

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Review ID" });
    }

    const deletedReview = await Review.findByIdAndDelete(id).exec();

    if (!deletedReview)
      return res.status(404).json({ message: "Review not found" });

    return res.status(204).send(); // 204 No Content
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
