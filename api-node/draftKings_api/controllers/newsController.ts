// draftKings_api/controllers/newsController.ts
import { Request, Response } from "express";
import { NewsService } from "../services/newsService";

const newsService = new NewsService();

const handleCorbaError = (res: Response, error: any) => {
  if (error.message === "CORBA_UNAVAILABLE") {
    return res
      .status(503)
      .json({ message: "Servicio externo de noticias no disponible." });
  }
  return res.status(500).json({
    message: "Error interno al comunicarse con el sistema de noticias.",
    error: error.message,
    // Puedes imprimir el "cause" original si lo necesitas para debugear
    cause: error.cause?.message,
  });
};

export const newsReadAll = async (req: Request, res: Response) => {
  try {
    const news = await newsService.getAllNews();
    return res.status(200).json(news);
  } catch (err: any) {
    return handleCorbaError(res, err);
  }
};

export const newsReadOne = async (req: Request, res: Response) => {
  try {
    // Forzamos que sea un string explícitamente para evitar el error de TypeScript
    const idParam = req.params.id as string;

    // Validamos antes de parsear por si acaso llega vacío
    if (!idParam) {
      return res.status(400).json({ message: "El ID es obligatorio." });
    }

    const id = parseInt(idParam, 10);

    if (isNaN(id)) {
      return res
        .status(400)
        .json({ message: "El ID de la noticia debe ser válido (numérico)." });
    }

    const news = await newsService.getNewsById(id);
    return res.status(200).json(news);
  } catch (err: any) {
    if (err.message === "NOT_FOUND") {
      return res.status(404).json({ message: "Noticia no encontrada." });
    }
    return handleCorbaError(res, err);
  }
};

export const newsCreate = async (req: Request, res: Response) => {
  try {
    const body = req.body;

    if (!body.titulo || !body.descripcion || !body.jugador) {
      return res
        .status(400)
        .json({
          message:
            "Body inválido. Faltan campos obligatorios (titulo, descripcion, jugador).",
        });
    }

    const newNews = await newsService.createNews(body);
    return res.status(201).json(newNews);
  } catch (err: any) {
    return handleCorbaError(res, err);
  }
};
