import { Request, Response } from "express";
import { User } from "../models/user";

/**
 * Controlador para sincronizar/actualizar el perfil del usuario.
 * El middleware de autorización ya ha validado el JWT y creado/obtenido el usuario.
 * Este controlador actualiza el userName y el role si se proporcionan en el body.
 */
export async function syncUser(req: Request, res: Response) {
  try {
    // El middleware authorizeRequest ya garantiza que req.user existe
    if (!req.user) {
      return res.status(401).json({ message: "Petición no autorizada" });
    }

    // Extraer los campos editables del body (opcional)
    const { userName, role } = req.body;

    const updateData: { userName?: string; role?: string } = {};

    if (userName && typeof userName === "string" && userName.trim()) {
      updateData.userName = userName.trim();
    }

    if (role === "ADMIN" || role === "USER") {
      updateData.role = role;
    }

    if (Object.keys(updateData).length > 0) {
      const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, {
        new: true, // Devolver el documento actualizado
      });

      return res.status(200).json(updatedUser);
    }

    // Si no se proporciona nada actualizable, devolver el usuario actual
    return res.status(200).json(req.user);
  } catch {
    return res.status(500).json({ message: "Error en el servidor" });
  }
}
