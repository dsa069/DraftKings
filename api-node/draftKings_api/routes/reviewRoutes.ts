import { Router } from "express";
import { reviewsUpdate, reviewsDelete } from "../controllers/reviewController";
import { authorizeRequest, requireAdmin } from "../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Reviews
 *     description: Operaciones CRUD completas para la gestión de comentarios y reseñas
 */

/**
 * @swagger
 * /api/reviews/{id}:
 *   put:
 *     summary: Editar comentario (ADMIN)
 *     description: Edita el texto y/o la puntuación de una reseña existente. Solo un usuario con rol de administrador puede editar comentarios.
 *     tags:
 *       - Reviews
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *               rating:
 *                 type: number
 *     responses:
 *       200:
 *         description: Comentario actualizado.
 *       400:
 *         description: El identificador no es válido, el body está vacío o no contiene campos editables.
 *       401:
 *         description: El token JWT falta o no es válido.
 *       403:
 *         description: El usuario autenticado no tiene permisos de administrador.
 *       404:
 *         description: Comentario no existe.
 *       500:
 *         description: Error interno inesperado.
 */
router.put("/:id", authorizeRequest, requireAdmin, reviewsUpdate);

/**
 * @swagger
 * /api/reviews/{id}:
 *   delete:
 *     summary: Eliminar comentario (ADMIN)
 *     description: Elimina una reseña (moderación). Solo un usuario con rol de administrador puede eliminar comentarios.
 *     tags:
 *       - Reviews
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Comentario eliminado.
 *       400:
 *         description: El identificador no es válido o no se pudo interpretar como ObjectId.
 *       401:
 *         description: El token JWT falta o no es válido.
 *       403:
 *         description: El usuario autenticado no tiene permisos de administrador.
 *       404:
 *         description: Comentario no existe.
 *       500:
 *         description: Error interno inesperado.
 */
router.delete("/:id", authorizeRequest, requireAdmin, reviewsDelete);

export default router;
