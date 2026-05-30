import { Router } from "express";
import { Request, Response } from "express";
//import { getHome } from "../controllers/dashboard";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  // Si process.env.APP_MESSAGE no existe, usará el texto de respaldo
  const mensajeParaFrontend = process.env.APP_MESSAGE || "Servidor API en ejecución correctamente";

  res.render("index", {
    title: "DraftKings Rest API",
    welcomeMessage: mensajeParaFrontend,
  });
});

export default router;
