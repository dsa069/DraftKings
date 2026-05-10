import { Router } from "express";
import { Request, Response } from "express";
import { getHome } from "../controllers/dashboard";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  // Cogemos la variable de entorno
  const mensajeParaFrontend = process.env.APP_MESSAGE;

  // Se la pasamos a la vista Pug
  res.render("index", {
    title: "Mi App",
    welcomeMessage: mensajeParaFrontend,
  });
});

export default router;
