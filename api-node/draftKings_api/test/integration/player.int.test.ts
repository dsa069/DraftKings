import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../../app";
import axios from "axios";
import Player from "../../models/player";
import { ApiFootballService } from "../../services/apiFootballService";
import {
  invalidPlayerAgeBody,
  playerBodyWithBirthdate,
  playerImportNotArrayBody,
  multipleValidImportPlayers,
  invalidImportPlayers,
  validPlayerBody,
} from "../utils/data/player.test.data";
import {
  withAdminAuth,
  withAuth,
  withUserAuth,
} from "../utils/helpers/authRequest.helper";
import {
  expectAdminForbidden,
  expectApiError,
  expectUnauthorized,
} from "../utils/helpers/apiAssertions.helper";
import {
  clearCollections,
  connectToInMemoryMongo,
  disconnectInMemoryMongo,
} from "../utils/helpers/mongoTestDb.helper";

// ============================================================================
// 1. MOCKS DE DEPENDENCIAS EXTERNAS Y MIDDLEWARES
// ============================================================================

// Mockeamos los middlewares de autenticación para no depender de Firebase real.
// Esto permite que las peticiones pasen directamente al controlador.
jest.mock("../../middleware/auth.middleware", () => ({
  authorizeRequest: jest.fn((req, res, next) => {
    // Permitimos pasar si tiene token clásico o si viene de un helper de test (x-test-role)
    if (!req.headers.authorization && !req.headers["x-test-role"]) {
      return res.status(401).json({ message: "Petición no autorizada" });
    }

    const role = req.headers["x-test-role"] === "ADMIN" ? "ADMIN" : "USER";

    // Simulamos un usuario autenticado por defecto
    req.user = { id: "mockUserId", role };
    next();
  }),
  authorizeRequestNoCreate: jest.fn((req, res, next) => {
    if (!req.headers.authorization && !req.headers["x-test-role"]) {
      return res.status(401).json({ message: "Petición no autorizada" });
    }

    const role = req.headers["x-test-role"] === "ADMIN" ? "ADMIN" : "USER";

    // Mantenemos el mismo comportamiento base para rutas que exigen usuario existente
    req.user = { id: "mockUserId", role };
    next();
  }),
  requireAdmin: jest.fn((req, res, next) => {
    if (req.user?.role !== "ADMIN") {
      return res.status(403).json({
        message: "Acceso denegado. Se requieren privilegios de Administrador.",
      });
    }

    // Asumimos que si llega aquí, le damos pase libre para el test
    next();
  }),
}));

// ============================================================================
// 2. CONFIGURACIÓN DE BASE DE DATOS EN MEMORIA (SETUP & TEARDOWN)
// ============================================================================

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await connectToInMemoryMongo();
  jest.spyOn(axios, "get");
});

afterAll(async () => {
  await disconnectInMemoryMongo(mongoServer);
});

beforeEach(async () => {
  await clearCollections(Player);
  jest.clearAllMocks();

  // Cinturón de seguridad: si un test no define mock explícito, nunca salimos a red.
  (axios.get as jest.Mock).mockReset();
  (axios.get as jest.Mock).mockRejectedValue(new Error("UNMOCKED_AXIOS_CALL"));
});

// ============================================================================
// 3. SUITE DE PRUEBAS PARA JUGADORES
// ============================================================================

describe("Player API Endpoints (/api/players)", () => {
  describe("POST /api/players (Crear Jugador)", () => {
    it("Debería retornar 401 si el usuario no está autenticado", async () => {
      const response = await request(app)
        .post("/api/players")
        .send(validPlayerBody);

      expectUnauthorized(response);
    });

    it("Debería crear un jugador correctamente y retornar 201", async () => {
      const response = await withAuth(request(app).post("/api/players")).send(
        validPlayerBody,
      );

      expect(response.status).toBe(201);
      expect(response.body.name).toBe(validPlayerBody.name);
      expect(response.body.id).toBeDefined(); // Verificamos el toJSON del schema
      expect(response.body.latitude).toBe(validPlayerBody.latitude);
    });

    it("Debería serializar birthdate en formato YYYY-MM-DD", async () => {
      const response = await withAuth(request(app).post("/api/players")).send(
        playerBodyWithBirthdate,
      );

      expect(response.status).toBe(201);
      expect(response.body.birthdate).toBe("2001-10-30");
      expect(response.body.longitude).toBe(validPlayerBody.longitude);
      expect(response.body.latitude).toBe(validPlayerBody.latitude);
    });

    it("Debería retornar 400 si Mongoose lanza ValidationError", async () => {
      const response = await withAuth(request(app).post("/api/players")).send(
        invalidPlayerAgeBody,
      );

      expectApiError(response, { status: 400, message: "Bad Request" });
    });

    it("Debería retornar 500 si falla el guardado del jugador", async () => {
      const saveSpy = jest
        .spyOn(Player.prototype, "save")
        .mockRejectedValueOnce(new Error("DB_DOWN"));

      const response = await withAuth(request(app).post("/api/players")).send(
        validPlayerBody,
      );

      expectApiError(response, {
        status: 500,
        message: "Internal Server Error",
      });
      saveSpy.mockRestore();
    });

    it("Debería retornar 400 si faltan campos obligatorios (name, latitude, longitude)", async () => {
      const invalidBody = { name: "Jugador Incompleto" }; // Faltan lat y long

      const response = await withAuth(request(app).post("/api/players")).send(
        invalidBody,
      );

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("Body inválido");
    });
  });

  describe("GET /api/players (Listar Jugadores)", () => {
    it("Debería retornar una lista paginada vacía al inicio (200)", async () => {
      const response = await request(app).get("/api/players");

      expect(response.status).toBe(200);
      expect(response.body.content).toBeInstanceOf(Array);
      expect(response.body.totalElements).toBe(0);
    });

    it("Debería retornar la lista de jugadores creados", async () => {
      // Setup: Creamos un jugador directamente en el modelo
      await request(app)
        .post("/api/players")
        .set("Authorization", "Bearer token")
        .send(validPlayerBody);

      const response = await request(app).get("/api/players");

      expect(response.status).toBe(200);
      expect(response.body.content.length).toBe(1);
      expect(response.body.content[0].name).toBe("Lionel Messi");
    });

    it("Debería retornar 400 si los parámetros de paginación son inválidos", async () => {
      const response = await request(app).get("/api/players?page=-1&size=0");

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parámetros de paginación inválidos");
    });
  });

  describe("GET /api/players/:id (Obtener un Jugador)", () => {
    it("Debería retornar 200 y el jugador si el ID existe", async () => {
      const createRes = await request(app)
        .post("/api/players")
        .set("Authorization", "Bearer token")
        .send(validPlayerBody);
      const playerId = createRes.body.id;

      const response = await request(app).get(`/api/players/${playerId}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(playerId);
      expect(response.body.name).toBe("Lionel Messi");
    });

    it("Debería retornar 404 si el ID es válido pero no existe en BD", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const response = await request(app).get(`/api/players/${fakeId}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("not found");
    });

    it("Debería retornar 400 si el ID tiene un formato inválido (CastError)", async () => {
      const response = await request(app).get(`/api/players/123-id-invalido`);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("ID inválido");
    });
  });

  describe("PUT /api/players/:id (Editar Jugador)", () => {
    it("Debería retornar 401 si el usuario no está autenticado", async () => {
      const response = await request(app)
        .put(`/api/players/${new mongoose.Types.ObjectId()}`)
        .send({ team: "Selección Argentina" });

      expectUnauthorized(response);
    });

    it("Debería retornar 403 si el usuario está autenticado pero no es admin", async () => {
      const createRes = await withAuth(request(app).post("/api/players")).send(
        validPlayerBody,
      );
      const playerId = createRes.body.id;

      const response = await withUserAuth(
        request(app).put(`/api/players/${playerId}`),
      ).send({ team: "Selección Argentina" });

      expectAdminForbidden(response);
    });

    it("Debería permitir la edición a un usuario admin autenticado", async () => {
      const createRes = await withAuth(request(app).post("/api/players")).send(
        validPlayerBody,
      );
      const playerId = createRes.body.id;

      const response = await withAdminAuth(
        request(app).put(`/api/players/${playerId}`),
      ).send({ team: "Selección Argentina", age: 37 });

      expect(response.status).toBe(200);
      expect(response.body.team).toBe("Selección Argentina");
      expect(response.body.age).toBe(37);
    });

    it("Debería actualizar los campos enviados y retornar 200", async () => {
      const createRes = await withAuth(request(app).post("/api/players")).send(
        validPlayerBody,
      );
      const playerId = createRes.body.id;

      const updateBody = { team: "Selección Argentina", age: 37 };

      const response = await withAdminAuth(
        request(app).put(`/api/players/${playerId}`),
      ).send(updateBody);

      expect(response.status).toBe(200);
      expect(response.body.team).toBe("Selección Argentina");
      expect(response.body.age).toBe(37);
      expect(response.body.name).toBe("Lionel Messi"); // El nombre se mantiene
    });
  });

  describe("DELETE /api/players/:id (Eliminar Jugador)", () => {
    it("Debería retornar 401 si el usuario no está autenticado", async () => {
      const response = await request(app).delete(
        `/api/players/${new mongoose.Types.ObjectId()}`,
      );

      expectUnauthorized(response);
    });

    it("Debería retornar 403 si el usuario está autenticado pero no es admin", async () => {
      const createRes = await withAuth(request(app).post("/api/players")).send(
        validPlayerBody,
      );
      const playerId = createRes.body.id;

      const response = await withUserAuth(
        request(app).delete(`/api/players/${playerId}`),
      );

      expectAdminForbidden(response);
    });

    it("Debería permitir la eliminación a un usuario admin autenticado", async () => {
      const createRes = await withAuth(request(app).post("/api/players")).send(
        validPlayerBody,
      );
      const playerId = createRes.body.id;

      const deleteRes = await withAdminAuth(
        request(app).delete(`/api/players/${playerId}`),
      );

      expect(deleteRes.status).toBe(204);

      const getRes = await request(app).get(`/api/players/${playerId}`);
      expect(getRes.status).toBe(404);
    });

    it("Debería eliminar un jugador existente y retornar 204", async () => {
      const createRes = await withAuth(request(app).post("/api/players")).send(
        validPlayerBody,
      );
      const playerId = createRes.body.id;

      const deleteRes = await withAdminAuth(
        request(app).delete(`/api/players/${playerId}`),
      );

      expect(deleteRes.status).toBe(204); // No content

      // Comprobamos que de verdad se borró
      const getRes = await request(app).get(`/api/players/${playerId}`);
      expect(getRes.status).toBe(404);
    });
  });

  describe("Integración de Servicios Externos (/external e /import)", () => {
    it("GET /api/players/external - Debería retornar 401 si no está autenticado", async () => {
      const response = await request(app).get(
        "/api/players/external?search=Mock",
      );

      expectUnauthorized(response);
    });

    it("GET /api/players/external - Debería retornar datos del mock de la API externa (200)", async () => {
      (axios.get as jest.Mock).mockResolvedValueOnce({
        data: {
          response: [
            {
              player: {
                name: "External Player Mock",
                firstname: "External",
                lastname: "Mock",
              },
            },
          ],
        },
      });

      const response = await withAuth(
        request(app).get("/api/players/external?search=Mock"),
      );

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body[0].name).toBe("External Player Mock");
    });

    it("GET /api/players/external - Debería retornar 503 cuando la API externa falla por timeout/network", async () => {
      const externalSpy = jest
        .spyOn(ApiFootballService.prototype, "searchPlayers")
        .mockRejectedValueOnce({
          isAxiosError: true,
          message: "network down",
        } as unknown as Error);

      const response = await withAuth(
        request(app).get("/api/players/external?search=Mock"),
      );

      expect(response.status).toBe(503);
      expect(response.body.message).toContain("Service Unavailable");
      externalSpy.mockRestore();
    });

    it("GET /api/players/external - Debería retornar 500 en error inesperado", async () => {
      (axios.get as jest.Mock).mockRejectedValueOnce(
        new Error("UNEXPECTED_ERROR"),
      );

      const response = await withAuth(
        request(app).get("/api/players/external?search=Mock"),
      );

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Internal Server Error");
    });

    it("POST /api/players/import - Debería retornar 201 al importar un array válido", async () => {
      const response = await withAuth(
        request(app).post("/api/players/import"),
      ).send(multipleValidImportPlayers);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("Players imported successfully");
    });

    it("POST /api/players/import - Debería retornar 401 si no está autenticado", async () => {
      const response = await request(app)
        .post("/api/players/import")
        .send(multipleValidImportPlayers);

      expectUnauthorized(response);
    });

    it("POST /api/players/import - Debería retornar 400 si el array contiene datos inválidos", async () => {
      const response = await withAuth(
        request(app).post("/api/players/import"),
      ).send(invalidImportPlayers);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain(
        "Cada elemento debe incluir al menos",
      );
    });

    it("POST /api/players/import - Debería retornar 400 si el body no es array", async () => {
      const response = await withAuth(
        request(app).post("/api/players/import"),
      ).send(playerImportNotArrayBody);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Expected an array of players");
    });

    it("POST /api/players/import - Debería retornar 400 si importPlayers lanza ValidationError", async () => {
      const insertSpy = jest.spyOn(Player, "insertMany").mockRejectedValueOnce({
        name: "ValidationError",
        message: "Validation failed",
      } as unknown as { name: string; message: string });

      const response = await withAuth(
        request(app).post("/api/players/import"),
      ).send(multipleValidImportPlayers);

      expectApiError(response, { status: 400, message: "Bad Request" });
      insertSpy.mockRestore();
    });

    it("POST /api/players/import - Debería retornar 500 en error inesperado", async () => {
      const insertSpy = jest
        .spyOn(Player, "insertMany")
        .mockRejectedValueOnce(new Error("DB_WRITE_FAIL"));

      const response = await withAuth(
        request(app).post("/api/players/import"),
      ).send(multipleValidImportPlayers);

      expectApiError(response, {
        status: 500,
        message: "Internal Server Error",
      });
      insertSpy.mockRestore();
    });
  });
});
