import { Router } from "express";
import {
  getAllPlayers,
  getPlayerById,
  createPlayer,
  updatePlayer,
  deletePlayer,
} from "../controllers/playerController";
import { authorizeRequest } from "../middleware/auth.middleware";

const router = Router();

// 3) Obtener listado de jugadores (Cualquier usuario autenticado común o superior)
router.get("/", authorizeRequest, getAllPlayers);

// 4) Obtener detalle de un jugador
router.get("/:id", authorizeRequest, getPlayerById);

// 5) Crear un jugador (Usuario Registrado o superior)
router.post("/", authorizeRequest, createPlayer);

// 7) Editar datos de un jugador (Exclusivo Administrador en la teoría, protegido por JWT)
router.put("/:id", authorizeRequest, updatePlayer);

// 8) Eliminar un jugador
router.delete("/:id", authorizeRequest, deletePlayer);

export default router;
