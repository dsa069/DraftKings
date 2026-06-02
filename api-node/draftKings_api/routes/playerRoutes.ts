import { Router } from "express";
import {
  playersReadAll,
  playersReadOne,
  playersCreate,
  playersUpdate,
  playersDelete,
  playersGetExternal,
  playersImport,
} from "../controllers/playerController";
import {
  reviewsGetByPlayer,
  reviewsCreate,
} from "../controllers/reviewController";
import { authorizeRequest, requireAdmin } from "../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Players
 *     description: Endpoints para la gestión de jugadores (Player CRUD)
 */

/**
 * @swagger
 * /api/players/external:
 *   get:
 *     summary: Obtener jugadores desde la API externa
 *     description: Consulta la API externa de fútbol y devuelve una lista normalizada de jugadores según el texto de búsqueda.
 *     tags:
 *       - Players
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Texto libre para buscar jugadores por nombre
 *     responses:
 *       200:
 *         description: Lista normalizada de jugadores.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Player'
 *       401:
 *         description: El token JWT falta o no es válido.
 *       500:
 *         description: Error consultando la API externa.
 *       503:
 *         description: Error de comunicación o timeout con la API externa.
 */
router.get("/external", authorizeRequest, playersGetExternal);

/**
 * @swagger
 * /api/players/import:
 *   post:
 *     summary: Importar jugadores desde la API externa a MongoDB
 *     description: Recibe un array de jugadores ya normalizados y los inserta en MongoDB.
 *     tags:
 *       - Players
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/Player'
 *     responses:
 *       201:
 *         description: Jugadores importados correctamente.
 *       400:
 *         description: El body no es un array de jugadores o falta name, latitude, longitude.
 *       401:
 *         description: El token JWT falta o no es válido.
 *       500:
 *         description: Error al insertar en base de datos.
 */
router.post("/import", authorizeRequest, playersImport);

/**
 * @swagger
 * /api/players:
 *   get:
 *     summary: Obtener listado de jugadores
 *     description: Devuelve una lista paginada de jugadores con filtros por query params.
 *     tags:
 *       - Players
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Texto libre para buscar por nombre
 *       - in: query
 *         name: team
 *         schema:
 *           type: string
 *       - in: query
 *         name: league
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 0
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Respuesta paginada de jugadores.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 content:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Player'
 *                 totalElements:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 number:
 *                   type: integer
 *                 size:
 *                   type: integer
 *       400:
 *         description: Parámetros de paginación inválidos.
 *       500:
 *         description: Error interno inesperado.
 */
router.get("/", playersReadAll);

/**
 * @swagger
 * /api/players/{id}:
 *   get:
 *     summary: Obtener detalle de un jugador
 *     description: Devuelve toda la información de un jugador por ID.
 *     tags:
 *       - Players
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Devuelve toda la información de un jugador por ID.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Player'
 *       400:
 *         description: Identificador no válido.
 *       404:
 *         description: Jugador no existe.
 *       500:
 *         description: Error interno inesperado.
 */
router.get("/:id", playersReadOne);

/**
 * @swagger
 * /api/players:
 *   post:
 *     summary: Crear un jugador (formulario interno)
 *     description: Registra un nuevo jugador manualmente.
 *     tags:
 *       - Players
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Player'
 *     responses:
 *       201:
 *         description: Jugador creado con éxito.
 *       400:
 *         description: Body inválido.
 *       401:
 *         description: El token JWT falta o no es válido.
 *       500:
 *         description: Error interno inesperado.
 */
router.post("/", authorizeRequest, playersCreate);

/**
 * @swagger
 * /api/players/{id}:
 *   put:
 *     summary: Editar datos de un jugador (ADMIN)
 *     description: Actualiza campos de un jugador existente. Solo un usuario con rol de administrador puede modificarlo.
 *     tags:
 *       - Players
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
 *             $ref: '#/components/schemas/Player'
 *     responses:
 *       200:
 *         description: Modificación procesada con éxito.
 *       400:
 *         description: El identificador no es válido.
 *       401:
 *         description: El token JWT falta o no es válido.
 *       403:
 *         description: El usuario autenticado no tiene permisos de administrador.
 *       404:
 *         description: Jugador no encontrado.
 *       500:
 *         description: Error interno inesperado.
 */
router.put("/:id", authorizeRequest, requireAdmin, playersUpdate);

/**
 * @swagger
 * /api/players/{id}:
 *   delete:
 *     summary: Eliminar un jugador (ADMIN)
 *     description: Borra un jugador permanentemente. Solo un usuario con rol de administrador puede eliminarlo.
 *     tags:
 *       - Players
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
 *         description: Eliminación exitosa.
 *       400:
 *         description: El identificador no es válido.
 *       401:
 *         description: El token JWT falta o no es válido.
 *       403:
 *         description: El usuario autenticado no tiene permisos de administrador.
 *       404:
 *         description: Jugador no encontrado.
 *       500:
 *         description: Error interno inesperado.
 */
router.delete("/:id", authorizeRequest, requireAdmin, playersDelete);

/**
 * @swagger
 * /api/players/{id}/reviews:
 *   get:
 *     summary: Obtener comentarios de un jugador
 *     description: Devuelve todas las reseñas para un jugador.
 *     tags:
 *       - Reviews
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del jugador
 *     responses:
 *       200:
 *         description: Lista de reseñas del jugador.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 *       400:
 *         description: Identificador de jugador inválido.
 *       404:
 *         description: Jugador no encontrado.
 *       500:
 *         description: Error interno inesperado.
 */
router.get("/:id/reviews", reviewsGetByPlayer);

/**
 * @swagger
 * /api/players/{id}/reviews:
 *   post:
 *     summary: Crear un comentario para un jugador
 *     description: Añade una reseña con texto, puntuación y ubicación.
 *     tags:
 *       - Reviews
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del jugador
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *               - rating
 *             properties:
 *               author:
 *                 type: string
 *               text:
 *                 type: string
 *               rating:
 *                 type: number
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *     responses:
 *       201:
 *         description: Comentario añadido con éxito.
 *       400:
 *         description: Body de la reseña inválido o incompleto.
 *       500:
 *         description: Error interno inesperado.
 *       503:
 *         description: Servicio de reseñas no disponible.
 */
router.post("/:id/reviews", reviewsCreate);

export default router;
