import { Router } from "express";
import {
  playersReadAll,
  playersReadOne,
  playersCreate,
  playersUpdate,
  playersDelete,
} from "../controllers/playerController";
import { authorizeRequest } from "../middleware/auth.middleware";

const router = Router();

// 3) Obtener listado de jugadores (Cualquier usuario autenticado común o superior)
router.get("/", playersReadAll);

// 4) Obtener detalle de un jugador
router.get("/:id", playersReadOne);

// 5) Crear un jugador (Usuario Registrado o superior)
router.post("/", authorizeRequest, playersCreate);

// 7) Editar datos de un jugador (Exclusivo Administrador en la teoría, protegido por JWT)
router.put("/:id", authorizeRequest, playersUpdate);

// 8) Eliminar un jugador
router.delete("/:id", authorizeRequest, playersDelete);

export default router;
