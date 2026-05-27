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

// Obtener de API Externa (Tiene que ir primero para no confundirse con el GET de detalle por ID)
router.get("/external", authorizeRequest, playersGetExternal);

// Importar array de jugadores (Tiene que ir antes del GET de detalle para no confundirse con el GET de detalle por ID)
router.post("/import", authorizeRequest, playersImport);

// 3) Obtener listado de jugadores (Cualquier usuario autenticado común o superior)
router.get("/", playersReadAll);

// 4) Obtener detalle de un jugador
router.get("/:id", playersReadOne);

// 5) Crear un jugador (Usuario Registrado o superior)
router.post("/", authorizeRequest, playersCreate);

// 7) Editar datos de un jugador (Exclusivo Administrador en la teoría, protegido por JWT)
router.put("/:id", authorizeRequest, requireAdmin, playersUpdate);

// 8) Eliminar un jugador
router.delete("/:id", authorizeRequest, requireAdmin, playersDelete);

// 10) Obtener comentarios de un jugador
router.get("/:id/reviews", reviewsGetByPlayer);

// 11) Crear comentario de un jugador
router.post("/:id/reviews", reviewsCreate);

export default router;
