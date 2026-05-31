// draftKings_api/routes/newsRoutes.ts
import { Router } from "express";
import {
  newsReadAll,
  newsReadOne,
  newsCreate,
} from "../controllers/newsController";
import { authorizeRequest, requireAdmin } from "../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: News
 *     description: Endpoints para la gestión de noticias con sistema externo CORBA
 */

/**
 * @swagger
 * /api/news:
 *   get:
 *     summary: Obtener todas las noticias de jugadores
 *     description: Consulta el sistema externo (CORBA) para obtener el listado de noticias.
 *     tags:
 *       - News
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de noticias devuelta correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   fecha:
 *                     type: string
 *                   jugador:
 *                     type: string
 *                   interes:
 *                     type: string
 *                   titulo:
 *                     type: string
 *                   descripcion:
 *                     type: string
 *                   etiquetas:
 *                     type: array
 *                     items:
 *                       type: string
 *       401:
 *         description: El token JWT falta o no es válido.
 *       500:
 *         description: Error al comunicarse con el sistema de noticias.
 *       503:
 *         description: El sistema externo de noticias (CORBA) no está disponible.
 */
router.get("/", authorizeRequest, newsReadAll);

/**
 * @swagger
 * /api/news/{id}:
 *   get:
 *     summary: Ver noticia en detalle
 *     description: Consulta el sistema externo (CORBA) para obtener una noticia por su ID.
 *     tags:
 *       - News
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID numérico de la noticia
 *     responses:
 *       200:
 *         description: Noticia encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 fecha:
 *                   type: string
 *                 jugador:
 *                   type: string
 *                 interes:
 *                   type: string
 *                 titulo:
 *                   type: string
 *                 descripcion:
 *                   type: string
 *                 etiquetas:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: El ID de la noticia debe ser válido.
 *       401:
 *         description: El token JWT falta o no es válido.
 *       404:
 *         description: La noticia no existe.
 *       500:
 *         description: Error al comunicarse con el sistema de noticias.
 *       503:
 *         description: El sistema externo de noticias (CORBA) no está disponible.
 */
router.get("/:id", authorizeRequest, newsReadOne);

/**
 * @swagger
 * /api/news:
 *   post:
 *     summary: Publicar una noticia (ADMIN)
 *     description: Crea una nueva noticia en el sistema externo. Sólo permitido para administradores.
 *     tags:
 *       - News
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: number
 *               fecha:
 *                 type: string
 *               jugador:
 *                 type: string
 *               interes:
 *                 type: string
 *               titulo:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               etiquetas:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Noticia publicada correctamente.
 *       400:
 *         description: Body inválido.
 *       401:
 *         description: El token JWT falta o no es válido.
 *       403:
 *         description: El usuario autenticado no tiene permisos de administrador.
 *       500:
 *         description: Error publicando la noticia en el sistema externo.
 *       503:
 *         description: El sistema externo de noticias (CORBA) no está disponible.
 */
router.post("/", authorizeRequest, newsCreate);

export default router;
