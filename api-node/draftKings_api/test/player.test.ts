import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../app";
import Player from "../models/player";

// ============================================================================
// 1. MOCKS DE DEPENDENCIAS EXTERNAS Y MIDDLEWARES
// ============================================================================

// Mockeamos los middlewares de autenticación para no depender de Firebase real.
// Esto permite que las peticiones pasen directamente al controlador.
jest.mock("../middleware/auth.middleware", () => ({
  authorizeRequest: jest.fn((req, res, next) => {
    // Simulamos un usuario autenticado por defecto
    req.user = { id: "mockUserId", role: "USER" };
    next();
  }),
  authorizeRequestNoCreate: jest.fn((req, res, next) => {
    // Mantenemos el mismo comportamiento base para rutas que exigen usuario existente
    req.user = { id: "mockUserId", role: "USER" };
    next();
  }),
  requireAdmin: jest.fn((req, res, next) => {
    // Asumimos que si llega aquí, le damos pase libre para el test
    next();
  }),
}));

// Mockeamos el servicio externo de API Football para no hacer peticiones HTTP reales
jest.mock("../services/apiFootballService", () => {
  return {
    ApiFootballService: jest.fn().mockImplementation(() => ({
      searchPlayers: jest
        .fn()
        .mockResolvedValue([
          { name: "External Player Mock", latitude: 0, longitude: 0 },
        ]),
      importPlayers: jest.fn().mockResolvedValue(true),
    })),
  };
});

// ============================================================================
// 2. CONFIGURACIÓN DE BASE DE DATOS EN MEMORIA (SETUP & TEARDOWN)
// ============================================================================

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  // Iniciamos la base de datos en memoria
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Si tu app.ts ya conecta a mongoose, asegúrate de que no lo haga durante los tests
  // o sobreescribe la conexión aquí.
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  // Cerramos conexiones al finalizar todos los tests
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Limpiamos la colección de jugadores antes de CADA prueba para asegurar aislamiento
  await Player.deleteMany({});
  jest.clearAllMocks();
});

// ============================================================================
// 3. SUITE DE PRUEBAS PARA JUGADORES
// ============================================================================

describe("Player API Endpoints (/api/players)", () => {
  const validPlayerBody = {
    name: "Lionel Messi",
    latitude: 41.3809,
    longitude: 2.1228,
    team: "Inter Miami",
    age: 36,
  };

  describe("POST /api/players (Crear Jugador)", () => {
    it("Debería crear un jugador correctamente y retornar 201", async () => {
      const response = await request(app)
        .post("/api/players")
        .set("Authorization", "Bearer mock-token") // El middleware está mockeado, pero enviamos el header
        .send(validPlayerBody);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe(validPlayerBody.name);
      expect(response.body.id).toBeDefined(); // Verificamos el toJSON del schema
      expect(response.body.latitude).toBe(validPlayerBody.latitude);
    });

    it("Debería retornar 400 si faltan campos obligatorios (name, latitude, longitude)", async () => {
      const invalidBody = { name: "Jugador Incompleto" }; // Faltan lat y long

      const response = await request(app)
        .post("/api/players")
        .set("Authorization", "Bearer mock-token")
        .send(invalidBody);

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
    it("Debería actualizar los campos enviados y retornar 200", async () => {
      const createRes = await request(app)
        .post("/api/players")
        .set("Authorization", "Bearer token")
        .send(validPlayerBody);
      const playerId = createRes.body.id;

      const updateBody = { team: "Selección Argentina", age: 37 };

      const response = await request(app)
        .put(`/api/players/${playerId}`)
        .set("Authorization", "Bearer token") // Simula admin por el mock
        .send(updateBody);

      expect(response.status).toBe(200);
      expect(response.body.team).toBe("Selección Argentina");
      expect(response.body.age).toBe(37);
      expect(response.body.name).toBe("Lionel Messi"); // El nombre se mantiene
    });
  });

  describe("DELETE /api/players/:id (Eliminar Jugador)", () => {
    it("Debería eliminar un jugador existente y retornar 204", async () => {
      const createRes = await request(app)
        .post("/api/players")
        .set("Authorization", "Bearer token")
        .send(validPlayerBody);
      const playerId = createRes.body.id;

      const deleteRes = await request(app)
        .delete(`/api/players/${playerId}`)
        .set("Authorization", "Bearer token");

      expect(deleteRes.status).toBe(204); // No content

      // Comprobamos que de verdad se borró
      const getRes = await request(app).get(`/api/players/${playerId}`);
      expect(getRes.status).toBe(404);
    });
  });

  describe("Integración de Servicios Externos (/external e /import)", () => {
    it("GET /api/players/external - Debería retornar datos del mock de la API externa (200)", async () => {
      const response = await request(app)
        .get("/api/players/external?search=Mock")
        .set("Authorization", "Bearer token");

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body[0].name).toBe("External Player Mock");
    });

    it("POST /api/players/import - Debería retornar 201 al importar un array válido", async () => {
      const playersToImport = [
        { name: "Jugador 1", latitude: 10, longitude: 20 },
        { name: "Jugador 2", latitude: 30, longitude: 40 },
      ];

      const response = await request(app)
        .post("/api/players/import")
        .set("Authorization", "Bearer token")
        .send(playersToImport);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("Players imported successfully");
    });

    it("POST /api/players/import - Debería retornar 400 si el array contiene datos inválidos", async () => {
      const invalidImport = [
        { name: "Jugador Valido", latitude: 10, longitude: 20 },
        { name: "Jugador Invalido" }, // Faltan lat y long
      ];

      const response = await request(app)
        .post("/api/players/import")
        .set("Authorization", "Bearer token")
        .send(invalidImport);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain(
        "Cada elemento debe incluir al menos",
      );
    });
  });
});
