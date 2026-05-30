import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../../app"; // Ajusta el path a tu app.ts
import { User } from "../../models/user";
import {
  adminSyncUserBody,
  blankSyncUserBody,
  testUserSeed,
  validSyncUserBody,
} from "../utils/data/user.test.data";
import { withAuth } from "../utils/helpers/authRequest.helper";
import {
  expectApiError,
  expectUnauthorized,
} from "../utils/helpers/apiAssertions.helper";
import {
  clearCollections,
  connectToInMemoryMongo,
  disconnectInMemoryMongo,
} from "../utils/helpers/mongoTestDb.helper";
// ============================================================================
// 1. MOCKS DE MIDDLEWARES
// ============================================================================

// Mockeamos el auth.middleware para inyectar el req.user y req.isNewUser dinámicamente
jest.mock("../../middleware/auth.middleware", () => ({
  authorizeRequest: jest.fn(async (req, res, next) => {
    if (!req.headers.authorization) {
      return res.status(401).json({ message: "Petición no autorizada" });
    }

    if (req.headers["x-test-no-user"] === "true") {
      req.user = undefined;
      req.isNewUser = true;
      return next();
    }

    // Buscamos el usuario de prueba recién creado en el beforeEach
    const user = await User.findOne();
    req.user = user;
    // Usamos un header secreto en las pruebas para simular si Firebase consideró al usuario como "nuevo"
    req.isNewUser = req.headers["x-test-is-new"] === "true";
    next();
  }),
  authorizeRequestNoCreate: jest.fn(async (req, res, next) => {
    if (!req.headers.authorization) {
      return res.status(401).json({ message: "Petición no autorizada" });
    }

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
  mongoServer = await connectToInMemoryMongo();
});

afterAll(async () => {
  await disconnectInMemoryMongo(mongoServer);
});

beforeEach(async () => {
  await clearCollections(User);
  jest.clearAllMocks();
});

// ============================================================================
// 3. SUITE DE PRUEBAS PARA USERS
// ============================================================================

describe("User API Endpoints (/api/user)", () => {
  // Helper para tener un usuario válido en la BD en cada test
  const createTestUser = async () => {
    return await User.create({
      ...testUserSeed,
    });
  };

  describe("POST /api/user/sync (Sincronizar Perfil)", () => {
    it("Debería retornar 401 si el usuario no está autenticado", async () => {
      const response = await request(app)
        .post("/api/user/sync")
        .send(validSyncUserBody);

      expectUnauthorized(response);
    });

    it("Debería retornar 200 si el usuario está autenticado", async () => {
      await createTestUser();

      const response = await withAuth(request(app).post("/api/user/sync"), {
        headers: { "x-test-is-new": "true" },
      }).send(validSyncUserBody);

      expect(response.status).toBe(200);
      expect(response.body.userName).toBe("Nuevo Nombre");
    });

    it("Debería retornar 401 cuando el middleware no inyecta req.user", async () => {
      await createTestUser();

      const response = await withAuth(request(app).post("/api/user/sync"), {
        headers: { "x-test-no-user": "true" },
      }).send({ userName: "NoDebeAplicar" });

      expectUnauthorized(response);
    });

    it("Debería retornar 200 si el usuario autenticado es admin", async () => {
      await createTestUser();

      const response = await withAuth(request(app).post("/api/user/sync"), {
        role: "ADMIN",
        headers: { "x-test-is-new": "true" },
      }).send(adminSyncUserBody);

      expect(response.status).toBe(200);
      expect(response.body.role).toBe("ADMIN");
    });

    it("Debería retornar 200 y actualizar el usuario si es nuevo (isNewUser=true)", async () => {
      await createTestUser();

      const response = await withAuth(request(app).post("/api/user/sync"), {
        headers: { "x-test-is-new": "true" },
      }).send(adminSyncUserBody);

      expect(response.status).toBe(200);
      expect(response.body.userName).toBe("NuevoNombre");
      expect(response.body.role).toBe("ADMIN");
      expect(response.body.email).toBe("test@example.com"); // Email no cambia
    });

    it("Debería retornar 409 si el usuario ya está sincronizado (isNewUser=false)", async () => {
      await createTestUser();

      const response = await withAuth(request(app).post("/api/user/sync"), {
        headers: { "x-test-is-new": "false" },
      }).send({ userName: "IntentoFallido" });

      expect(response.status).toBe(409);
      expect(response.body.message).toBe("Usuario ya sincronizado");
    });

    it("Debería devolver el usuario actual si no hay campos válidos para actualizar", async () => {
      await createTestUser();

      const response = await withAuth(request(app).post("/api/user/sync"), {
        headers: { "x-test-is-new": "true" },
      }).send(blankSyncUserBody);

      expect(response.status).toBe(200);
      expect(response.body.userName).toBe("UsuarioTest");
      expect(response.body.role).toBe("USER");
    });

    it("Debería retornar 500 cuando falla la actualización en BD", async () => {
      await createTestUser();
      const updateSpy = jest
        .spyOn(User, "findByIdAndUpdate")
        .mockRejectedValueOnce(new Error("SYNC_FAIL"));

      const response = await withAuth(request(app).post("/api/user/sync"), {
        headers: { "x-test-is-new": "true" },
      }).send(validSyncUserBody);

      expectApiError(response, {
        status: 500,
        message: "Error en el servidor",
      });
      updateSpy.mockRestore();
    });
  });

  describe("GET /api/user/profile (Obtener Perfil)", () => {
    it("Debería retornar 401 si el usuario no está autenticado", async () => {
      const response = await request(app).get("/api/user/profile");

      expectUnauthorized(response);
    });

    it("Debería retornar 200 si el usuario está autenticado", async () => {
      await createTestUser();

      const response = await withAuth(request(app).get("/api/user/profile"));

      expect(response.status).toBe(200);
      expect(response.body.email).toBe("test@example.com");
    });

    it("Debería retornar 200 si el usuario autenticado es admin", async () => {
      await createTestUser();

      const response = await withAuth(request(app).get("/api/user/profile"), {
        role: "ADMIN",
      });

      expect(response.status).toBe(200);
      expect(response.body.firebaseUid).toBe("testUid123");
    });

    it("Debería retornar 200 y los datos del perfil del usuario", async () => {
      await createTestUser();

      const response = await withAuth(request(app).get("/api/user/profile"));

      expect(response.status).toBe(200);
      expect(response.body.email).toBe("test@example.com");
      expect(response.body.firebaseUid).toBe("testUid123");
    });
  });
});
