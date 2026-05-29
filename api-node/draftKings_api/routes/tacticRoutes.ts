import { Router } from "express";
import { getAiRecommendations } from "../controllers/tacticController";
import { authorizeRequest } from "../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Tactics
 *     description: Operaciones relacionadas con tácticas e Inteligencia Artificial
 */

/**
 * @swagger
 * /api/tactics/recommendations:
 *   post:
 *     summary: Obtener recomendaciones de la IA para completar alineación
 *     description: Procesa las posiciones actuales mediante una IA para sugerir jugadores para las posiciones vacías.
 *     tags:
 *       - Tactics
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - positions
 *             properties:
 *               positions:
 *                 type: object
 *                 description: Objeto con las posiciones del campo como claves y el nombre del jugador asignado o null como valor.
 *                 additionalProperties:
 *                   type: string
 *                   nullable: true
 *     responses:
 *       200:
 *         description: Recomendaciones generadas con éxito.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 recommendations:
 *                   type: object
 *                   additionalProperties:
 *                     type: string
 *       400:
 *         description: El formato del mapa de posiciones es inválido o no se han enviado datos.
 *       401:
 *         description: El token JWT falta o no es válido.
 *       500:
 *         description: Error interno del servidor.
 *       503:
 *         description: Error de comunicación o timeout con el proveedor del servicio de Inteligencia Artificial.
 */
router.post("/recommendations", authorizeRequest, getAiRecommendations);

export default router;
