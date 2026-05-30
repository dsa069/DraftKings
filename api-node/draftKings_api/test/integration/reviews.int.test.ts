import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../../app"; // Ajusta el path a tu app.ts
import Review from "../../models/review";
import Player from "../../models/player";
import {
  integrationReviewBodyWithoutAuthor,
  integrationReviewSeed,
  reviewUpdateFullBody,
  validReviewBody,
} from "../utils/data/review.test.data";
import { integrationTestPlayerSeed } from "../utils/data/player.test.data";
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
import {
  createPlayerDocument,
  createReviewDocument,
} from "../utils/helpers/entityFactory.helper";

// ============================================================================
// 1. MOCKS DE DEPENDENCIAS EXTERNAS Y MIDDLEWARES
// ============================================================================

// Creamos un ObjectId válido para simular el usuario autenticado
const mockUserId = new mongoose.Types.ObjectId();

jest.mock("../../middleware/auth.middleware", () => ({
  authorizeRequest: jest.fn((req, res, next) => {
    // Aceptamos la petición si trae Authorization normal O si viene de los helpers (x-test-role)
    if (!req.headers.authorization && !req.headers["x-test-role"]) {
      return res.status(401).json({ message: "Petición no autorizada" });
    }

    const role = req.headers["x-test-role"] === "ADMIN" ? "ADMIN" : "USER";

    // Simulamos un usuario autenticado. Usamos _id porque Mongoose lo requiere para referencias
    req.user = { _id: mockUserId, role };
    next();
  }),
  authorizeRequestNoCreate: jest.fn((req, res, next) => {
    if (!req.headers.authorization && !req.headers["x-test-role"]) {
      return res.status(401).json({ message: "Petición no autorizada" });
    }

    const role = req.headers["x-test-role"] === "ADMIN" ? "ADMIN" : "USER";

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
  mongoServer = await connectToInMemoryMongo();
});

afterAll(async () => {
  await disconnectInMemoryMongo(mongoServer);
});

beforeEach(async () => {
  await clearCollections(Review, Player);
  jest.clearAllMocks();
});

// ============================================================================
// 3. SUITE DE PRUEBAS PARA REVIEWS
// ============================================================================

describe("Review API Endpoints", () => {
  const createTestPlayer = async () =>
    createPlayerDocument({
      ...integrationTestPlayerSeed,
    });

  const createTestReview = async (
    playerId: mongoose.Types.ObjectId,
    overrides: Partial<
      Pick<
        typeof integrationReviewSeed,
        "author" | "text" | "rating" | "coords"
      >
    > = {},
  ) =>
    createReviewDocument({
      user: mockUserId,
      player: playerId,
      author: overrides.author ?? integrationReviewSeed.author,
      text: overrides.text ?? integrationReviewSeed.text,
      rating: overrides.rating ?? integrationReviewSeed.rating,
      coords: overrides.coords ?? integrationReviewSeed.coords,
    });

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
      const response = await withAuth(
        request(app).post(`/api/players/id-invalido/reviews`),
      ).send(validReviewBody);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("inválido");
    });

    it("Debería usar el autor por defecto cuando no se envía author", async () => {
      const player = await createTestPlayer();

      const response = await withAuth(
        request(app).post(`/api/players/${player._id}/reviews`),
      ).send(integrationReviewBodyWithoutAuthor);

      expect(response.status).toBe(201);
      expect(response.body.author).toBe("Anónimo");
    });

    it("Debería retornar 503 cuando hay error de red/timeout en persistencia", async () => {
      const player = await createTestPlayer();
      const saveSpy = jest
        .spyOn(Review.prototype, "save")
        .mockRejectedValueOnce({
          name: "MongoNetworkError",
          message: "connection timeout",
        });

      const response = await withAuth(
        request(app).post(`/api/players/${player._id}/reviews`),
      ).send(validReviewBody);

      expectApiError(response, {
        status: 503,
        message: "Servicio de reseñas no disponible",
      });
      saveSpy.mockRestore();
    });

    it("Debería retornar 500 en error inesperado al crear reseña", async () => {
      const player = await createTestPlayer();
      const saveSpy = jest
        .spyOn(Review.prototype, "save")
        .mockRejectedValueOnce(new Error("REVIEW_CREATE_FAIL"));

      const response = await withAuth(
        request(app).post(`/api/players/${player._id}/reviews`),
      ).send(validReviewBody);

      expectApiError(response, {
        status: 500,
        message: "Error interno inesperado",
      });
      saveSpy.mockRestore();
    });
  });

  describe("GET /api/players/:id/reviews (Obtener Comentarios)", () => {
    it("Debería retornar 200 y la lista de comentarios del jugador", async () => {
      const player = await createTestPlayer();

      // Insertamos una reseña de prueba manualmente
      await createTestReview(player._id);

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

      expectUnauthorized(response);
    });

    it("Debería retornar 403 si el usuario está autenticado pero no es admin", async () => {
      const player = await createTestPlayer();
      const review = await createTestReview(player._id, {
        author: "Fan Original",
        text: "Texto original",
        rating: 3,
      });

      const response = await withUserAuth(
        request(app).put(`/api/reviews/${review._id}`),
      ).send(reviewUpdateFullBody);

      expectAdminForbidden(response);
    });

    it("Debería permitir la edición a un usuario admin autenticado", async () => {
      const player = await createTestPlayer();
      const review = await createTestReview(player._id);

      const updateData = reviewUpdateFullBody;

      const response = await withAdminAuth(
        request(app).put(`/api/reviews/${review._id}`),
      ).send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.text).toBe("Texto editado");
      expect(response.body.rating).toBe(5);
    });

    it("Debería actualizar el texto y el rating retornando 200", async () => {
      const player = await createTestPlayer();
      const review = await createTestReview(player._id);

      const updateData = reviewUpdateFullBody;

      const response = await withAdminAuth(
        request(app).put(`/api/reviews/${review._id}`),
      ).send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.text).toBe("Texto editado");
      expect(response.body.rating).toBe(5);
    });

    it("Debería retornar 400 si el body está vacío", async () => {
      const response = await withAdminAuth(
        request(app).put(`/api/reviews/${new mongoose.Types.ObjectId()}`),
      ).send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Body de la reseña inválido"); // Según tu controller
    });

    it("Debería retornar 404 si el comentario a actualizar no existe", async () => {
      const fakeReviewId = new mongoose.Types.ObjectId();

      const response = await withAdminAuth(
        request(app).put(`/api/reviews/${fakeReviewId}`),
      ).send({ text: "Algo", rating: 4 });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Comentario no existe");
    });

    it("Debería retornar 500 en error inesperado al actualizar", async () => {
      const player = await createTestPlayer();
      const review = await createTestReview(player._id);

      const updateSpy = jest
        .spyOn(Review, "findByIdAndUpdate")
        .mockReturnValueOnce({
          exec: jest.fn().mockRejectedValueOnce(new Error("UPDATE_FAIL")),
        } as any);

      const response = await withAdminAuth(
        request(app).put(`/api/reviews/${review._id}`),
      ).send({ text: "Nuevo texto" });

      expectApiError(response, {
        status: 500,
        message: "Error interno inesperado",
      });
      updateSpy.mockRestore();
    });
  });

  describe("DELETE /api/reviews/:id (Eliminar Comentario)", () => {
    it("Debería retornar 401 si el usuario no está autenticado", async () => {
      const response = await request(app).delete(
        `/api/reviews/${new mongoose.Types.ObjectId()}`,
      );

      expectUnauthorized(response);
    });

    it("Debería retornar 403 si el usuario está autenticado pero no es admin", async () => {
      const player = await createTestPlayer();
      const review = await createTestReview(player._id, {
        author: "Para borrar",
        text: "Malo",
        rating: 1,
      });

      const response = await withUserAuth(
        request(app).delete(`/api/reviews/${review._id}`),
      );

      expectAdminForbidden(response);
    });

    it("Debería permitir el borrado a un usuario admin autenticado", async () => {
      const player = await createTestPlayer();
      const review = await createTestReview(player._id, {
        author: "Para borrar",
        text: "Malo",
        rating: 1,
      });

      const response = await withAdminAuth(
        request(app).delete(`/api/reviews/${review._id}`),
      );

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

      const response = await withAdminAuth(
        request(app).delete(`/api/reviews/${review._id}`),
      );

      // Verificamos si tu controlador devuelve 204 No Content o un 200 con mensaje JSON.
      // Dependiendo de tu implementación exacta, ajusta el expect a .toBe(200) o .toBe(204)
      expect([200, 204]).toContain(response.status);

      // Comprobamos en base de datos que realmente se haya borrado
      const reviewInDb = await Review.findById(review._id);
      expect(reviewInDb).toBeNull();
    });

    it("Debería retornar 400 si el ID tiene formato inválido", async () => {
      const response = await withAdminAuth(
        request(app).delete(`/api/reviews/id-mal-formado`),
      );

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid Review ID");
    });

    it("Debería retornar 500 en error inesperado al eliminar", async () => {
      const player = await createTestPlayer();
      const review = await createTestReview(player._id, {
        author: "Fan",
        text: "Texto",
        rating: 2,
      });

      const deleteSpy = jest
        .spyOn(Review, "findByIdAndDelete")
        .mockReturnValueOnce({
          exec: jest.fn().mockRejectedValueOnce(new Error("DELETE_FAIL")),
        } as any);

      const response = await withAdminAuth(
        request(app).delete(`/api/reviews/${review._id}`),
      );

      expectApiError(response, {
        status: 500,
        message: "Error interno inesperado",
      });
      deleteSpy.mockRestore();
    });
  });
});
