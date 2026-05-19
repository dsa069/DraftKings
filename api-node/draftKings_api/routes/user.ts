import { Router, Request, Response } from "express";
import { authorizeRequest } from "../middleware/auth.middleware";

const router = Router();

/**
 * @route   GET /api/user/profile
 * @desc    Ruta protegida para obtener el perfil del usuario autenticado
 * @access  Privado
 */
router.get(
  "/profile",
  authorizeRequest,
  async (req: Request, res: Response) => {
    try {
      // Al pasar el middleware, req.user está completamente tipado y garantizado (PDF línea 173)
      return res.json(req.user);
    } catch (error) {
      console.error("Error al obtener perfil:", error);
      return res.status(500).json({ message: "Error en el servidor" });
    }
  },
);

export default router;
