import request from "supertest";
import app from "../../../app";
import axios from "axios";
import {
  corbaCreateOkResponse,
  corbaListEmptyResponse,
  corbaListOkResponse,
  corbaReadNotFoundResponse,
  corbaReadOkResponse,
  invalidNewsCreateBody,
  validNewsCreateBody,
} from "../utils/data/news.test.data";
import {
  withAdminAuth,
  withAuth,
  withUserAuth,
} from "../utils/helpers/authRequest.helper";
import {
  expectAdminForbidden,
  expectUnauthorized,
} from "../utils/helpers/apiAssertions.helper";

jest.mock("axios");

jest.mock("../../middleware/auth.middleware", () => ({
  authorizeRequest: jest.fn((req, res, next) => {
    if (!req.headers.authorization) {
      return res.status(401).json({ message: "Petición no autorizada" });
    }

    const role = req.headers["x-test-role"] === "ADMIN" ? "ADMIN" : "USER";
    req.user = { id: "mockUserId", role };
    next();
  }),
  authorizeRequestNoCreate: jest.fn((req, res, next) => {
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

describe("News API Endpoints (/api/news)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/news", () => {
    it("Debería retornar 401 si no está autenticado", async () => {
      const response = await request(app).get("/api/news");

      expectUnauthorized(response);
    });

    it("Debería retornar 200 con el listado de noticias", async () => {
      (axios.get as jest.Mock).mockResolvedValue(corbaListOkResponse);

      const response = await withAuth(request(app).get("/api/news"));

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(2);
      expect(response.body[0].id).toBe(1);
    });

    it("Debería retornar 200 y array vacío cuando CORBA indica buffer vacío", async () => {
      (axios.get as jest.Mock).mockResolvedValue(corbaListEmptyResponse);

      const response = await withAuth(request(app).get("/api/news"));

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it("Debería retornar 503 cuando CORBA está caído", async () => {
      (axios.get as jest.Mock).mockRejectedValue(new Error("network timeout"));

      const response = await withAuth(request(app).get("/api/news"));

      expect(response.status).toBe(503);
      expect(response.body.message).toBe(
        "Servicio externo de noticias no disponible.",
      );
    });
  });

  describe("GET /api/news/:id", () => {
    it("Debería retornar 400 si el id no es numérico", async () => {
      const response = await withAuth(
        request(app).get("/api/news/id-invalido"),
      );

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("numérico");
    });

    it("Debería retornar 404 si la noticia no existe", async () => {
      (axios.post as jest.Mock).mockResolvedValue(corbaReadNotFoundResponse);

      const response = await withAuth(request(app).get("/api/news/999"));

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Noticia no encontrada.");
    });

    it("Debería retornar 200 con la noticia por id", async () => {
      (axios.post as jest.Mock).mockResolvedValue(corbaReadOkResponse);

      const response = await withAuth(request(app).get("/api/news/1"));

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(1);
      expect(response.body.titulo).toBe("Nuevo talento en ascenso");
    });
  });

  describe("POST /api/news", () => {
    it("Debería retornar 401 si no está autenticado", async () => {
      const response = await request(app)
        .post("/api/news")
        .send(validNewsCreateBody);

      expectUnauthorized(response);
    });

    it("Debería retornar 403 si el usuario no es admin", async () => {
      const response = await withUserAuth(request(app).post("/api/news")).send(
        validNewsCreateBody,
      );

      expectAdminForbidden(response);
    });

    it("Debería retornar 400 si faltan campos obligatorios", async () => {
      const response = await withAdminAuth(request(app).post("/api/news")).send(
        invalidNewsCreateBody,
      );

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("Faltan campos obligatorios");
    });

    it("Debería retornar 201 al crear noticia con admin", async () => {
      (axios.post as jest.Mock).mockResolvedValue(corbaCreateOkResponse);

      const response = await withAdminAuth(request(app).post("/api/news")).send(
        validNewsCreateBody,
      );

      expect(response.status).toBe(201);
      expect(response.body.titulo).toBe("Nuevo talento en ascenso");
    });

    it("Debería retornar 503 cuando el servicio externo no responde", async () => {
      (axios.post as jest.Mock).mockRejectedValue({ code: "ECONNREFUSED" });

      const response = await withAdminAuth(request(app).post("/api/news")).send(
        validNewsCreateBody,
      );

      expect(response.status).toBe(503);
      expect(response.body.message).toBe(
        "Servicio externo de noticias no disponible.",
      );
    });
  });
});
