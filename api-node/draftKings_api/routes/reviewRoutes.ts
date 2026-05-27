// routes/reviewRoutes.ts
import { Router } from "express";
import { reviewsUpdate, reviewsDelete } from "../controllers/reviewController";
import { authorizeRequest, requireAdmin } from "../middleware/auth.middleware"; // Asegúrate de ajustar el path

const router = Router();

// 12) Editar comentario
router.put("/:id", authorizeRequest, requireAdmin, reviewsUpdate);

// 13) Eliminar comentario (Solo Admins idealmente)
router.delete("/:id", authorizeRequest, requireAdmin, reviewsDelete);

export default router;
