import { Router } from "express";
import { getAiRecommendations } from "../controllers/tacticController";
import { authorizeRequest } from "../middleware/auth.middleware";

const router = Router();

// 16) Obtener recomendaciones de la IA para completar alineación
// Protegido por JWT (devuelve 401 si falla el middleware)
router.post("/recommendations", authorizeRequest, getAiRecommendations);

export default router;
