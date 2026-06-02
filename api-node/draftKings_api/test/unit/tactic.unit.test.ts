import { Request, Response } from "express";
import { getAiRecommendations } from "../../controllers/tacticController";
import { AiTacticService } from "../../services/aiTacticService";
import {
  emptyTacticPositionsBody,
  fullTacticPositions,
  invalidTacticRequestBody,
  singleEmptyTacticPositions,
  tacticNoEmptyPositionsErrorMessage,
  tacticServiceErrorMessage,
  unitAiTacticResponse,
  validTacticPositions,
} from "../utils/data/tactic.test.data";
import { createExpressMockContext } from "../utils/helpers/expressMock.helper";

// 1. Mockeamos el servicio de la Inteligencia Artificial (Evitamos llamadas a Groq)
jest.mock("../../services/aiTacticService");

describe("TacticController (Pruebas Unitarias)", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseJsonMock: jest.Mock;
  let responseStatusMock: jest.Mock;

  beforeEach(() => {
    const ctx = createExpressMockContext({ body: {} });
    mockRequest = ctx.req;
    mockResponse = ctx.res;
    responseJsonMock = ctx.jsonMock;
    responseStatusMock = ctx.statusMock;

    jest.clearAllMocks();
  });

  describe("getAiRecommendations", () => {
    it("Debería retornar 400 si el body no tiene la propiedad 'positions'", async () => {
      mockRequest.body = invalidTacticRequestBody; // Body inválido para Zod

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
      mockRequest.body = emptyTacticPositionsBody;

      await getAiRecommendations(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(responseStatusMock).toHaveBeenCalledWith(400);
    });

    it("Debería retornar 200 y la respuesta de la IA si el body es válido", async () => {
      mockRequest.body = { positions: validTacticPositions };

      // Simulamos que el servicio IA procesa y responde con éxito
      (
        AiTacticService.prototype.getRecommendations as jest.Mock
      ).mockResolvedValue(unitAiTacticResponse);

      await getAiRecommendations(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Comprobamos que el servicio fue invocado con las posiciones exactas
      expect(AiTacticService.prototype.getRecommendations).toHaveBeenCalledWith(
        validTacticPositions,
      );
      expect(responseStatusMock).toHaveBeenCalledWith(200);
      expect(responseJsonMock).toHaveBeenCalledWith(unitAiTacticResponse);
    });

    it("Debería retornar 400 si la IA lanza el error 'NO_EMPTY_POSITIONS'", async () => {
      mockRequest.body = { positions: fullTacticPositions }; // Sin nulos

      // Simulamos el error lanzado desde el catch del servicio
      (
        AiTacticService.prototype.getRecommendations as jest.Mock
      ).mockRejectedValue(new Error(tacticNoEmptyPositionsErrorMessage));

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
      mockRequest.body = { positions: singleEmptyTacticPositions };

      (
        AiTacticService.prototype.getRecommendations as jest.Mock
      ).mockRejectedValue(new Error(tacticServiceErrorMessage));

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
      mockRequest.body = { positions: singleEmptyTacticPositions };

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
