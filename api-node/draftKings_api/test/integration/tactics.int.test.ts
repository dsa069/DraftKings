import request from "supertest";
import app from "../../../app";
import { AiTacticService } from "../../services/aiTacticService";
import {
  fullTacticPositions,
  invalidTacticRequestBody,
  integrationAiTacticResponse,
  singleEmptyTacticPositions,
  validTacticPositions,
} from "../utils/data/tactic.test.data";

// ============================================================================
// 1. MOCKS DE MIDDLEWARES Y SERVICIOS DE IA
// ============================================================================

// Mockeamos autenticación básica
jest.mock("../../middleware/auth.middleware", () => ({
  authorizeRequestNoCreate: jest.fn((req, res, next) => {
    if (!req.headers.authorization) {
      return res.status(401).json({ message: "Petición no autorizada" });
    }

    const role = req.headers["x-test-role"] === "ADMIN" ? "ADMIN" : "USER";

    // Mantenemos el mismo comportamiento base para rutas que exigen usuario existente
    req.user = { id: "mockUserId", role };
    next();
  }),
  authorizeRequest: jest.fn((req, res, next) => {
    if (!req.headers.authorization) {
      return res.status(401).json({ message: "Petición no autorizada" });
    }

    const role = req.headers["x-test-role"] === "ADMIN" ? "ADMIN" : "USER";
    req.user = { id: "mockUserId", role };
    next();
  }),
  requireAdmin: jest.fn((req, res, next) => {
    if (req.user?.role !== "ADMIN") {
      return res.status(403).json({
        message: "Acceso denegado. Se requieren privilegios de Administrador.",
      });
    }

    next();
  }),
}));

// Mockeamos la clase AiTacticService para NO gastar tokens de Groq/LangChain
jest.mock("../../services/aiTacticService");

// ============================================================================
// 2. SUITE DE PRUEBAS PARA TACTICS
// ============================================================================

describe("Tactics API Endpoints (/api/tactics)", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Cinturón de seguridad: ningún test debe tocar proveedor real de IA.
    (AiTacticService.prototype.getRecommendations as jest.Mock).mockReset();
    (
      AiTacticService.prototype.getRecommendations as jest.Mock
    ).mockRejectedValue(new Error("UNMOCKED_AI_CALL"));
  });

  describe("POST /api/tactics/recommendations", () => {
    it("Debería retornar 401 si el usuario no está autenticado", async () => {
      const response = await request(app)
        .post("/api/tactics/recommendations")
        .send({ positions: singleEmptyTacticPositions });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Petición no autorizada");
    });

    it("Debería retornar 200 si el usuario está autenticado", async () => {
      (
        AiTacticService.prototype.getRecommendations as jest.Mock
      ).mockResolvedValueOnce({
        ...integrationAiTacticResponse,
      });

      const response = await request(app)
        .post("/api/tactics/recommendations")
        .set("Authorization", "Bearer mock-token")
        .send({ positions: validTacticPositions });

      expect(response.status).toBe(200);
      expect(response.body.recommendations).toHaveProperty(
        "ST",
        "Erling Haaland",
      );
    });

    it("Debería retornar 200 si el usuario autenticado es admin", async () => {
      (
        AiTacticService.prototype.getRecommendations as jest.Mock
      ).mockResolvedValueOnce({
        ...integrationAiTacticResponse,
      });

      const response = await request(app)
        .post("/api/tactics/recommendations")
        .set("Authorization", "Bearer mock-token")
        .set("x-test-role", "ADMIN")
        .send({ positions: { ST: null } });

      expect(response.status).toBe(200);
      expect(response.body.recommendations).toHaveProperty(
        "ST",
        "Erling Haaland",
      );
    });

    it("Debería retornar 200 y las recomendaciones generadas por la IA", async () => {
      // Configuramos el mock para que devuelva un caso de éxito
      (
        AiTacticService.prototype.getRecommendations as jest.Mock
      ).mockResolvedValueOnce({
        message: "Te falta un buen delantero centro para rematar centros.",
        recommendations: { ST: "Erling Haaland" },
      });

      const requestBody = {
        positions: {
          GK: "Courtois",
          CB: "Sergio Ramos",
          ST: null, // Posición vacía a rellenar
        },
      };

      const response = await request(app)
        .post("/api/tactics/recommendations")
        .set("Authorization", "Bearer mock-token")
        .send(requestBody);

      expect(response.status).toBe(200);
      expect(response.body.message).toBeDefined();
      expect(response.body.recommendations).toHaveProperty(
        "ST",
        "Erling Haaland",
      );
    });

    it("Debería retornar 400 si el body no incluye el objeto 'positions'", async () => {
      const response = await request(app)
        .post("/api/tactics/recommendations")
        .set("Authorization", "Bearer mock-token")
        .send(invalidTacticRequestBody);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain(
        "El formato del mapa de posiciones es inválido",
      );
    });

    it("Debería retornar 400 si no hay posiciones vacías (null)", async () => {
      // Configuramos el mock para lanzar el error exacto que lanza tu servicio original
      (
        AiTacticService.prototype.getRecommendations as jest.Mock
      ).mockRejectedValueOnce(new Error("NO_EMPTY_POSITIONS"));

      const requestBody = {
        positions: fullTacticPositions,
      };

      const response = await request(app)
        .post("/api/tactics/recommendations")
        .set("Authorization", "Bearer mock-token")
        .send(requestBody);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        "Bad Request. No hay posiciones vacías para recomendar.",
      );
    });

    it("Debería retornar 503 si el servicio de IA falla (timeout o error de LangChain)", async () => {
      (
        AiTacticService.prototype.getRecommendations as jest.Mock
      ).mockRejectedValueOnce(new Error("AI_SERVICE_ERROR"));

      const requestBody = {
        positions: singleEmptyTacticPositions,
      };

      const response = await request(app)
        .post("/api/tactics/recommendations")
        .set("Authorization", "Bearer mock-token")
        .send(requestBody);

      expect(response.status).toBe(503);
      expect(response.body.message).toContain(
        "Error de comunicación o timeout con el proveedor",
      );
    });

    it("Debería retornar 500 si ocurre un error desconocido", async () => {
      (
        AiTacticService.prototype.getRecommendations as jest.Mock
      ).mockRejectedValueOnce(new Error("UNHANDLED_ERROR"));

      const response = await request(app)
        .post("/api/tactics/recommendations")
        .set("Authorization", "Bearer mock-token")
        .send({ positions: validTacticPositions });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Unknown Error");
    });
  });
});
