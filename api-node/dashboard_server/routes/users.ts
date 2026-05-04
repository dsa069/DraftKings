import { Router } from "express";
import { getUsers } from "../controllers/users";

const router = Router();

// GET users listing
router.get("/", getUsers);

export default router;
