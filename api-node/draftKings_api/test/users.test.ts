import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../app"; // Ajusta el path a tu app.ts
import { User } from "../models/user";
// ============================================================================
// 1. MOCKS DE MIDDLEWARES
// ============================================================================

// Mockeamos el auth.middleware para inyectar el req.user y req.isNewUser dinámicamente
jest.mock("../middleware/auth.middleware", () => ({
  authorizeRequest: jest.fn(async (req, res, next) => {
    // Buscamos el usuario de prueba recién creado en el beforeEach
    const user = await User.findOne();
    req.user = user;
    // Usamos un header secreto en las pruebas para simular si Firebase consideró al usuario como "nuevo"
    req.isNewUser = req.headers["x-test-is-new"] === "true";
    next();
  }),
  authorizeRequestNoCreate: jest.fn(async (req, res, next) => {
    const user = await User.findOne();
    req.user = user;
    next();
  }),
  requireAdmin: jest.fn((req, res, next) => next()),
}));

// ============================================================================
// 2. CONFIGURACIÓN DE BD EN MEMORIA
// ============================================================================

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
  jest.clearAllMocks();
});

// ============================================================================
// 3. SUITE DE PRUEBAS PARA USERS
// ============================================================================

describe("User API Endpoints (/api/user)", () => {
  // Helper para tener un usuario válido en la BD en cada test
  const createTestUser = async () => {
    return await User.create({
      firebaseUid: "testUid123",
      email: "test@example.com",
      userName: "UsuarioTest",
      role: "USER",
    });
  };

  describe("POST /api/user/sync (Sincronizar Perfil)", () => {
    it("Debería retornar 200 y actualizar el usuario si es nuevo (isNewUser=true)", async () => {
      await createTestUser();

      const response = await request(app)
        .post("/api/user/sync")
        .set("Authorization", "Bearer mock-token")
        .set("x-test-is-new", "true") // Simulamos que es su primer login
        .send({ userName: "NuevoNombre", role: "ADMIN" });

      expect(response.status).toBe(200);
      expect(response.body.userName).toBe("NuevoNombre");
      expect(response.body.role).toBe("ADMIN");
      expect(response.body.email).toBe("test@example.com"); // Email no cambia
    });

    it("Debería retornar 409 si el usuario ya está sincronizado (isNewUser=false)", async () => {
      await createTestUser();

      const response = await request(app)
        .post("/api/user/sync")
        .set("Authorization", "Bearer mock-token")
        .set("x-test-is-new", "false") // Simulamos login recurrente
        .send({ userName: "IntentoFallido" });

      expect(response.status).toBe(409);
      expect(response.body.message).toBe("Usuario ya sincronizado");
    });
  });

  describe("GET /api/user/profile (Obtener Perfil)", () => {
    it("Debería retornar 200 y los datos del perfil del usuario", async () => {
      await createTestUser();

      const response = await request(app)
        .get("/api/user/profile")
        .set("Authorization", "Bearer mock-token");

      expect(response.status).toBe(200);
      expect(response.body.email).toBe("test@example.com");
      expect(response.body.firebaseUid).toBe("testUid123");
    });
  });
});
