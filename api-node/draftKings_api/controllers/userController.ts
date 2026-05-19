import { Request, Response } from "express";
import { User } from "../models/user";

/**
 * Controlador para sincronizar/actualizar el perfil del usuario.
 * El middleware de autorización ya ha validado el JWT y creado/obtenido el usuario.
 * Este controlador actualiza el userName si se proporciona en el body.
 */
export async function syncUser(req: Request, res: Response) {
  try {
    // El middleware authorizeRequest ya garantiza que req.user existe
    if (!req.user) {
      return res.status(401).json({ message: "Petición no autorizada" });
    }

    // Extraer el userName del body (opcional)
    const { userName } = req.body;

    // Si se proporciona un userName, actualizar el usuario
    if (userName && typeof userName === "string" && userName.trim()) {
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { userName: userName.trim() },
        { new: true }, // Devolver el documento actualizado
      );

      return res.status(200).json(updatedUser);
    }

    // Si no se proporciona userName, devolver el usuario actual
    return res.status(200).json(req.user);
  } catch (error) {
    console.error("Error al sincronizar usuario:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
}
