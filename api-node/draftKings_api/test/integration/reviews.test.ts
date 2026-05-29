import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../../app"; // Ajusta el path a tu app.ts
import Review from "../../models/review";
import Player from "../../models/player";

// ============================================================================
// 1. MOCKS DE DEPENDENCIAS EXTERNAS Y MIDDLEWARES
// ============================================================================

// Creamos un ObjectId válido para simular el usuario autenticado
const mockUserId = new mongoose.Types.ObjectId();

jest.mock("../../middleware/auth.middleware", () => ({
  authorizeRequest: jest.fn((req, res, next) => {
    if (!req.headers.authorization) {
      return res.status(401).json({ message: "Petición no autorizada" });
    }

    const role = req.headers["x-test-role"] === "ADMIN" ? "ADMIN" : "USER";

    // Simulamos un usuario autenticado. Usamos _id porque Mongoose lo requiere para referencias
    req.user = { _id: mockUserId, role };
    next();
  }),
  authorizeRequestNoCreate: jest.fn((req, res, next) => {
    if (!req.headers.authorization) {
      return res.status(401).json({ message: "Petición no autorizada" });
    }

    const role = req.headers["x-test-role"] === "ADMIN" ? "ADMIN" : "USER";

    // Mantenemos el mismo comportamiento base para rutas que exigen usuario existente
    req.user = { _id: mockUserId, role };
    next();
  }),

  requireAdmin: jest.fn((req, res, next) => {
    if (req.user?.role !== "ADMIN") {
      return res.status(403).json({
        message: "Acceso denegado. Se requieren privilegios de Administrador.",
      });
    }

    next(); // Pase libre porque asumimos que ya pasó el authorizeRequest
  }),
}));

// ============================================================================
// 2. CONFIGURACIÓN DE BASE DE DATOS EN MEMORIA
// ============================================================================

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Limpiamos AMBAS colecciones porque están relacionadas
  await Review.deleteMany({});
  await Player.deleteMany({});
  jest.clearAllMocks();
});

// ============================================================================
// 3. SUITE DE PRUEBAS PARA REVIEWS
// ============================================================================

describe("Review API Endpoints", () => {
  // Helper para crear un jugador válido rápidamente antes de probar las reseñas
  const createTestPlayer = async () => {
    const player = new Player({
      name: "Jugador de Prueba",
      coords: { type: "Point", coordinates: [0, 0] },
    });
    return await player.save();
  };

  const validReviewBody = {
    author: "Test Author",
    text: "Excelente jugador, gran visión de juego.",
    rating: 5,
    latitude: 40.4168,
    longitude: -3.7038,
  };

  // -------------------------------------------------------------------------
  // ENDPOINTS EN /api/players/:id/reviews
  // -------------------------------------------------------------------------
  describe("POST /api/players/:id/reviews (Crear Comentario)", () => {
    it("Debería crear una reseña correctamente y retornar 201", async () => {
      const player = await createTestPlayer();

      const response = await request(app)
        .post(`/api/players/${player._id}/reviews`)
        .set("Authorization", "Bearer mock-token")
        .send(validReviewBody);

      // Verificamos que aunque la ruta no tenga middleware en el snippet,
      // si lo tuviera, pasa correctamente. Si no lo tiene, evalúa la lógica.
      expect(response.status).toBe(201); // Suponiendo que el controller devuelve 201
      expect(response.body.text).toBe(validReviewBody.text);
      expect(response.body.rating).toBe(validReviewBody.rating);
    });

    it("Debería retornar 404 si el jugador no existe", async () => {
      const fakePlayerId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .post(`/api/players/${fakePlayerId}/reviews`)
        .set("Authorization", "Bearer mock-token")
        .send(validReviewBody);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Jugador no encontrado"); // Según tu controller
    });

    it("Debería retornar 400 si el ID del jugador es inválido", async () => {
      const response = await request(app)
        .post(`/api/players/id-invalido/reviews`)
        .set("Authorization", "Bearer mock-token")
        .send(validReviewBody);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("inválido");
    });
  });

  describe("GET /api/players/:id/reviews (Obtener Comentarios)", () => {
    it("Debería retornar 200 y la lista de comentarios del jugador", async () => {
      const player = await createTestPlayer();

      // Insertamos una reseña de prueba manualmente
      await Review.create({
        user: mockUserId,
        player: player._id,
        author: "Fan 1",
        text: "Buen partido",
        rating: 4,
        coords: { type: "Point", coordinates: [-3.7, 40.4] },
      });

      const response = await request(app).get(
        `/api/players/${player._id}/reviews`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(1);
      expect(response.body[0].text).toBe("Buen partido");
    });

    it("Debería retornar 404 si el jugador no existe", async () => {
      const fakePlayerId = new mongoose.Types.ObjectId();
      const response = await request(app).get(
        `/api/players/${fakePlayerId}/reviews`,
      );

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Jugador no encontrado");
    });
  });

  // -------------------------------------------------------------------------
  // ENDPOINTS EN /api/reviews/:id (Requieren ADMIN según el Swagger)
  // -------------------------------------------------------------------------
  describe("PUT /api/reviews/:id (Editar Comentario)", () => {
    it("Debería retornar 401 si el usuario no está autenticado", async () => {
      const response = await request(app)
        .put(`/api/reviews/${new mongoose.Types.ObjectId()}`)
        .send({ text: "Texto editado", rating: 5 });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Petición no autorizada");
    });

    it("Debería retornar 403 si el usuario está autenticado pero no es admin", async () => {
      const player = await createTestPlayer();
      const review = await Review.create({
        user: mockUserId,
        player: player._id,
        author: "Fan Original",
        text: "Texto original",
        rating: 3,
        coords: { type: "Point", coordinates: [0, 0] },
      });

      const response = await request(app)
        .put(`/api/reviews/${review._id}`)
        .set("Authorization", "Bearer mock-token")
        .set("x-test-role", "USER")
        .send({ text: "Texto editado", rating: 5 });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe(
        "Acceso denegado. Se requieren privilegios de Administrador.",
      );
    });

    it("Debería permitir la edición a un usuario admin autenticado", async () => {
      const player = await createTestPlayer();
      const review = await Review.create({
        user: mockUserId,
        player: player._id,
        author: "Fan Original",
        text: "Texto original",
        rating: 3,
        coords: { type: "Point", coordinates: [0, 0] },
      });

      const updateData = { text: "Texto editado", rating: 5 };

      const response = await request(app)
        .put(`/api/reviews/${review._id}`)
        .set("Authorization", "Bearer mock-token-admin")
        .set("x-test-role", "ADMIN")
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.text).toBe("Texto editado");
      expect(response.body.rating).toBe(5);
    });

    it("Debería actualizar el texto y el rating retornando 200", async () => {
      const player = await createTestPlayer();
      const review = await Review.create({
        user: mockUserId,
        player: player._id,
        author: "Fan Original",
        text: "Texto original",
        rating: 3,
        coords: { type: "Point", coordinates: [0, 0] },
      });

      const updateData = { text: "Texto editado", rating: 5 };

      const response = await request(app)
        .put(`/api/reviews/${review._id}`)
        .set("Authorization", "Bearer mock-token-admin")
        .set("x-test-role", "ADMIN")
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.text).toBe("Texto editado");
      expect(response.body.rating).toBe(5);
    });

    it("Debería retornar 400 si el body está vacío", async () => {
      const response = await request(app)
        .put(`/api/reviews/${new mongoose.Types.ObjectId()}`)
        .set("Authorization", "Bearer mock-token-admin")
        .set("x-test-role", "ADMIN")
        .send({}); // Enviamos un body vacío

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Body de la reseña inválido"); // Según tu controller
    });

    it("Debería retornar 404 si el comentario a actualizar no existe", async () => {
      const fakeReviewId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .put(`/api/reviews/${fakeReviewId}`)
        .set("Authorization", "Bearer mock-token-admin")
        .set("x-test-role", "ADMIN")
        .send({ text: "Algo", rating: 4 });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Comentario no existe");
    });
  });

  describe("DELETE /api/reviews/:id (Eliminar Comentario)", () => {
    it("Debería retornar 401 si el usuario no está autenticado", async () => {
      const response = await request(app).delete(
        `/api/reviews/${new mongoose.Types.ObjectId()}`,
      );

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Petición no autorizada");
    });

    it("Debería retornar 403 si el usuario está autenticado pero no es admin", async () => {
      const player = await createTestPlayer();
      const review = await Review.create({
        user: mockUserId,
        player: player._id,
        author: "Para borrar",
        text: "Malo",
        rating: 1,
        coords: { type: "Point", coordinates: [0, 0] },
      });

      const response = await request(app)
        .delete(`/api/reviews/${review._id}`)
        .set("Authorization", "Bearer mock-token")
        .set("x-test-role", "USER");

      expect(response.status).toBe(403);
      expect(response.body.message).toBe(
        "Acceso denegado. Se requieren privilegios de Administrador.",
      );
    });

    it("Debería permitir el borrado a un usuario admin autenticado", async () => {
      const player = await createTestPlayer();
      const review = await Review.create({
        user: mockUserId,
        player: player._id,
        author: "Para borrar",
        text: "Malo",
        rating: 1,
        coords: { type: "Point", coordinates: [0, 0] },
      });

      const response = await request(app)
        .delete(`/api/reviews/${review._id}`)
        .set("Authorization", "Bearer mock-token-admin")
        .set("x-test-role", "ADMIN");

      expect([200, 204]).toContain(response.status);

      const reviewInDb = await Review.findById(review._id);
      expect(reviewInDb).toBeNull();
    });

    it("Debería eliminar un comentario y retornar 204 o 200", async () => {
      const player = await createTestPlayer();
      const review = await Review.create({
        user: mockUserId,
        player: player._id,
        author: "Para borrar",
        text: "Malo",
        rating: 1,
        coords: { type: "Point", coordinates: [0, 0] },
      });

      const response = await request(app)
        .delete(`/api/reviews/${review._id}`)
        .set("Authorization", "Bearer mock-token-admin")
        .set("x-test-role", "ADMIN");

      // Verificamos si tu controlador devuelve 204 No Content o un 200 con mensaje JSON.
      // Dependiendo de tu implementación exacta, ajusta el expect a .toBe(200) o .toBe(204)
      expect([200, 204]).toContain(response.status);

      // Comprobamos en base de datos que realmente se haya borrado
      const reviewInDb = await Review.findById(review._id);
      expect(reviewInDb).toBeNull();
    });

    it("Debería retornar 400 si el ID tiene formato inválido", async () => {
      const response = await request(app)
        .delete(`/api/reviews/id-mal-formado`)
        .set("Authorization", "Bearer mock-token-admin")
        .set("x-test-role", "ADMIN");

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid Review ID");
    });
  });
});
