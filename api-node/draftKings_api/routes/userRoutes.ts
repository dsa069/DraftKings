import { Router, Request, Response } from "express";
import {
  authorizeRequest,
  authorizeRequestNoCreate,
} from "../middleware/auth.middleware";
import { syncUser } from "../controllers/userController";

const router = Router();

/**
 * @route   POST /api/user/sync
 * @desc    Sincroniza/registra al usuario autenticado y opcionalmente actualiza su userName
 * @access  Privado (requiere JWT válido de Firebase)
 * @body    { userName?: string }
 * @note    Este endpoint CREA el usuario si no existe (Just-In-Time Provisioning)
 */
router.post("/sync", authorizeRequest, syncUser);

/**
 * @route   GET /api/user/profile
 * @desc    Obtiene el perfil del usuario autenticado
 * @access  Privado (requiere JWT válido de Firebase y usuario ya registrado)
 * @note    Este endpoint NO crea usuarios. El usuario debe haberse registrado previamente con POST /api/user/sync
 */
router.get(
  "/profile",
  authorizeRequestNoCreate,
  async (req: Request, res: Response) => {
    try {
      // El middleware authorizeRequestNoCreate garantiza que req.user existe y está registrado
      return res.json(req.user);
    } catch (error) {
      console.error("Error al obtener perfil:", error);
      return res.status(500).json({ message: "Error en el servidor" });
    }
  },
);

export default router;
