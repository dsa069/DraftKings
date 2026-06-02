import { Router, Request, Response } from "express";
import {
  authorizeRequest,
  authorizeRequestNoCreate,
} from "../middleware/auth.middleware";
import { syncUser } from "../controllers/userController";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: Autenticación, sincronización y perfiles de usuario
 */

/**
 * @swagger
 * /api/user/sync:
 *   post:
 *     summary: Sincronizar / Registrar Usuario
 *     description: Registra al usuario en la base de datos interna usando el UID y el email extraídos del token JWT.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *                 description: Nombre de usuario a registrar.
 *               role:
 *                 type: string
 *                 description: Opcional, si no se envía el backend asigna 'USER'.
 *     responses:
 *       200:
 *         description: Usuario sincronizado y registrado con éxito.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: El token de autenticación falta o no es válido.
 *       409:
 *         description: El usuario ya se encuentra sincronizado.
 *       500:
 *         description: Error interno del servidor inesperado.
 */
router.post("/sync", authorizeRequest, syncUser);

/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: Obtener perfil del usuario autenticado
 *     description: Devuelve la información del usuario actualmente autenticado a partir del JWT.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: El token JWT de autenticación falta o expiró.
 *       404:
 *         description: Usuario no localizado en la base de datos.
 *       500:
 *         description: Error interno del servidor.
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
