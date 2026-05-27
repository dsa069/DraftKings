// routes/reviewRoutes.ts
import { Router } from "express";
import { reviewsUpdate, reviewsDelete } from "../controllers/reviewController";
import { authorizeRequest } from "../middleware/auth.middleware"; // Asegúrate de ajustar el path

const router = Router();

// 12) Editar comentario
router.put("/:id", authorizeRequest, reviewsUpdate);

// 13) Eliminar comentario (Solo Admins idealmente)
router.delete("/:id", authorizeRequest, reviewsDelete);

export default router;
