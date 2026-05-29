import { Request, Response } from "express";
import { getAiRecommendations } from "../../controllers/tacticController";
import { AiTacticService } from "../../services/aiTacticService";

// 1. Mockeamos el servicio de la Inteligencia Artificial (Evitamos llamadas a Groq)
jest.mock("../../services/aiTacticService");

describe("TacticController (Pruebas Unitarias)", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseJsonMock: jest.Mock;
  let responseStatusMock: jest.Mock;

  beforeEach(() => {
    responseJsonMock = jest.fn();
    responseStatusMock = jest.fn().mockReturnValue({ json: responseJsonMock });

    mockRequest = { body: {} };
    mockResponse = {
      status: responseStatusMock,
      json: responseJsonMock,
    };

    jest.clearAllMocks();
  });

  describe("getAiRecommendations", () => {
    it("Debería retornar 400 si el body no tiene la propiedad 'positions'", async () => {
      mockRequest.body = { randomKey: "algo" }; // Body inválido para Zod

      await getAiRecommendations(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(responseStatusMock).toHaveBeenCalledWith(400);
      expect(responseJsonMock).toHaveBeenCalledWith({
        message:
          "Bad Request. El formato del mapa de posiciones es inválido o no se han enviado datos.",
      });
      // Verificamos que al fallar la validación Zod, nunca se llamó a la IA
      expect(
        AiTacticService.prototype.getRecommendations,
      ).not.toHaveBeenCalled();
    });

    it("Debería retornar 400 si el objeto 'positions' está vacío", async () => {
      mockRequest.body = { positions: {} };

      await getAiRecommendations(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(responseStatusMock).toHaveBeenCalledWith(400);
    });

    it("Debería retornar 200 y la respuesta de la IA si el body es válido", async () => {
      const validPositions = { GK: "Courtois", ST: null };
      mockRequest.body = { positions: validPositions };

      const mockAiResponse = {
        message: "Te falta un delantero.",
        recommendations: { ST: "Haaland" },
      };

      // Simulamos que el servicio IA procesa y responde con éxito
      (
        AiTacticService.prototype.getRecommendations as jest.Mock
      ).mockResolvedValue(mockAiResponse);

      await getAiRecommendations(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Comprobamos que el servicio fue invocado con las posiciones exactas
      expect(AiTacticService.prototype.getRecommendations).toHaveBeenCalledWith(
        validPositions,
      );
      expect(responseStatusMock).toHaveBeenCalledWith(200);
      expect(responseJsonMock).toHaveBeenCalledWith(mockAiResponse);
    });

    it("Debería retornar 400 si la IA lanza el error 'NO_EMPTY_POSITIONS'", async () => {
      mockRequest.body = { positions: { GK: "Courtois", ST: "Benzema" } }; // Sin nulos

      // Simulamos el error lanzado desde el catch del servicio
      (
        AiTacticService.prototype.getRecommendations as jest.Mock
      ).mockRejectedValue(new Error("NO_EMPTY_POSITIONS"));

      await getAiRecommendations(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(responseStatusMock).toHaveBeenCalledWith(400);
      expect(responseJsonMock).toHaveBeenCalledWith({
        message: "Bad Request. No hay posiciones vacías para recomendar.",
      });
    });

    it("Debería retornar 503 si ocurre un error general en el servicio de IA", async () => {
      mockRequest.body = { positions: { ST: null } };

      (
        AiTacticService.prototype.getRecommendations as jest.Mock
      ).mockRejectedValue(new Error("AI_SERVICE_ERROR"));

      await getAiRecommendations(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(responseStatusMock).toHaveBeenCalledWith(503);
      expect(responseJsonMock).toHaveBeenCalledWith({
        message: expect.stringContaining(
          "Service Unavailable. Error de comunicación o timeout",
        ),
      });
    });

    it("Debería retornar 500 si ocurre un error inesperado", async () => {
      mockRequest.body = { positions: { ST: null } };

      (
        AiTacticService.prototype.getRecommendations as jest.Mock
      ).mockRejectedValue(new Error("unexpected failure"));

      await getAiRecommendations(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(responseStatusMock).toHaveBeenCalledWith(500);
      expect(responseJsonMock).toHaveBeenCalledWith({
        message: "Unknown Error",
        error: "unexpected failure",
      });
    });
  });
});
