import { Router } from "express";
import { getHome } from "../controllers/dashboard";

const router = Router();

// GET home page
router.get("/", getHome);

export default router;
