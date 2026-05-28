import { Request, Response } from "express";
import { z } from "zod";
import { AiTacticService } from "../services/aiTacticService";

const aiTacticService = new AiTacticService();

// Validamos el body que envía el frontend
const requestBodySchema = z.object({
  positions: z.record(z.string(), z.string().nullable()),
});

export const getAiRecommendations = async (req: Request, res: Response) => {
  try {
    // 1. Validar Body
    const parsedBody = requestBodySchema.safeParse(req.body);

    if (
      !parsedBody.success ||
      Object.keys(parsedBody.data.positions).length === 0
    ) {
      return res.status(400).json({
        message:
          "Bad Request. El formato del mapa de posiciones es inválido o no se han enviado datos.",
      });
    }

    // 2. Obtener recomendaciones
    const { positions } = parsedBody.data;
    const aiResponse = await aiTacticService.getRecommendations(positions);

    // 3. Respuesta OK (El parser de LangChain ya nos asegura que es el JSON correcto)
    return res.status(200).json(aiResponse);
  } catch (err: any) {
    if (err.message === "NO_EMPTY_POSITIONS") {
      return res.status(400).json({
        message: "Bad Request. No hay posiciones vacías para recomendar.",
      });
    }

    if (err.message === "AI_SERVICE_ERROR") {
      return res.status(503).json({
        message:
          "Service Unavailable. Error de comunicación o timeout con el proveedor de IA (Groq).",
      });
    }

    return res
      .status(500)
      .json({ message: "Unknown Error", error: err.message });
  }
};
