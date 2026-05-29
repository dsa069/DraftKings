import { Request, Response } from "express";
import mongoose from "mongoose";
import {
  reviewsCreate,
  reviewsGetByPlayer,
  reviewsUpdate,
  reviewsDelete,
  // reviewsCreate (Añádelo si lo vas a testear aquí también)
} from "../../controllers/reviewController";
import Review from "../../models/review";
import Player from "../../models/player";
import {
  emptyReviewUpdateBody,
  mockReviewList,
  mockSavedReview,
  mockUpdatedReview,
  reviewCreateMissingRatingBody,
  reviewUpdateRatingBody,
  reviewUpdateTextBody,
  validReviewBody,
} from "../utils/data/review.test.data";
import { createExpressMockContext } from "../utils/helpers/expressMock.helper";
import { mockExecResolved } from "../utils/helpers/mongooseQuery.helper";

// 1. Mockeamos los modelos de Mongoose para aislar la base de datos
jest.mock("../../models/review");
jest.mock("../../models/player");

describe("ReviewController (Pruebas Unitarias)", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseJsonMock: jest.Mock;
  let responseStatusMock: jest.Mock;
  let responseSendMock: jest.Mock;

  // Creamos un ObjectId válido constante para las pruebas
  const validObjectId = new mongoose.Types.ObjectId().toString();

  beforeEach(() => {
    const ctx = createExpressMockContext({
      params: {},
      body: {},
    });
    mockRequest = ctx.req;
    mockResponse = ctx.res;
    responseJsonMock = ctx.jsonMock;
    responseStatusMock = ctx.statusMock;
    responseSendMock = ctx.sendMock;

    jest.clearAllMocks();
  });

  // ========================================================================
  // GET /api/players/:id/reviews -> reviewsGetByPlayer
  // ========================================================================
  describe("reviewsGetByPlayer", () => {
    it("Debería retornar 400 si el ID del jugador es inválido", async () => {
      mockRequest.params = { id: "id-totalmente-invalido" };

      await reviewsGetByPlayer(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(responseStatusMock).toHaveBeenCalledWith(400);
      expect(responseJsonMock).toHaveBeenCalledWith({
        message: "Identificador de jugador inválido",
      });
    });

    it("Debería retornar 404 si el jugador no existe en la BD", async () => {
      mockRequest.params = { id: validObjectId };

      // Simulamos que Player.findById devuelve null (no existe)
      (Player.findById as jest.Mock).mockReturnValue(mockExecResolved(null));

      await reviewsGetByPlayer(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(responseStatusMock).toHaveBeenCalledWith(404);
      expect(responseJsonMock).toHaveBeenCalledWith({
        message: "Jugador no encontrado",
      });
    });

    it("Debería retornar 200 y el array de reseñas si todo es correcto", async () => {
      mockRequest.params = { id: validObjectId };

      // Simulamos que el jugador existe
      (Player.findById as jest.Mock).mockReturnValue(
        mockExecResolved({ _id: validObjectId, name: "Jugador Test" }),
      );

      // Simulamos que Review.find devuelve el array de reseñas
      (Review.find as jest.Mock).mockReturnValue(
        mockExecResolved(mockReviewList),
      );

      await reviewsGetByPlayer(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Verificamos el comportamiento esperado
      expect(Review.find).toHaveBeenCalledWith({ player: validObjectId });
      expect(responseStatusMock).toHaveBeenCalledWith(200);
      expect(responseJsonMock).toHaveBeenCalledWith(mockReviewList);
    });
  });

  // ========================================================================
  // POST /api/players/:id/reviews -> reviewsCreate
  // ========================================================================
  describe("reviewsCreate", () => {
    it("Debería retornar 400 si el ID del jugador no es válido", async () => {
      mockRequest.params = { id: "id-invalido" };

      await reviewsCreate(mockRequest as Request, mockResponse as Response);

      expect(responseStatusMock).toHaveBeenCalledWith(400);
      expect(responseJsonMock).toHaveBeenCalledWith({
        message: "Identificador de jugador inválido",
      });
    });

    it("Debería retornar 400 si faltan text o rating", async () => {
      mockRequest.params = { id: validObjectId };
      mockRequest.body = reviewCreateMissingRatingBody;

      await reviewsCreate(mockRequest as Request, mockResponse as Response);

      expect(responseStatusMock).toHaveBeenCalledWith(400);
      expect(responseJsonMock).toHaveBeenCalledWith({
        message:
          "Body de la reseña inválido o incompleto. Se requiere text y rating.",
      });
    });

    it("Debería retornar 404 si el jugador no existe", async () => {
      mockRequest.params = { id: validObjectId };
      mockRequest.body = { text: "Gran partido", rating: 5 };

      (Player.findById as jest.Mock).mockReturnValue(mockExecResolved(null));

      await reviewsCreate(mockRequest as Request, mockResponse as Response);

      expect(responseStatusMock).toHaveBeenCalledWith(404);
      expect(responseJsonMock).toHaveBeenCalledWith({
        message: "Jugador no encontrado",
      });
    });

    it("Debería crear y devolver una reseña", async () => {
      mockRequest.params = { id: validObjectId };
      mockRequest.body = validReviewBody;
      mockRequest.user = { _id: validObjectId, userName: "Tester" };

      (Player.findById as jest.Mock).mockReturnValue(
        mockExecResolved({ _id: validObjectId }),
      );

      (Review as unknown as jest.Mock).mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(mockSavedReview),
      }));

      await reviewsCreate(mockRequest as Request, mockResponse as Response);

      expect(responseStatusMock).toHaveBeenCalledWith(201);
      expect(responseJsonMock).toHaveBeenCalledWith(mockSavedReview);
    });

    it("Debería retornar 503 si la persistencia falla por timeout", async () => {
      mockRequest.params = { id: validObjectId };
      mockRequest.body = { text: "Gran partido", rating: 5 };

      (Player.findById as jest.Mock).mockReturnValue(
        mockExecResolved({ _id: validObjectId }),
      );

      (Review as unknown as jest.Mock).mockImplementation(() => ({
        save: jest
          .fn()
          .mockRejectedValue(
            Object.assign(new Error("timeout"), { name: "MongooseError" }),
          ),
      }));

      await reviewsCreate(mockRequest as Request, mockResponse as Response);

      expect(responseStatusMock).toHaveBeenCalledWith(503);
      expect(responseJsonMock).toHaveBeenCalledWith({
        message: "Servicio de reseñas no disponible",
      });
    });
  });

  // ========================================================================
  // PUT /api/reviews/:id -> reviewsUpdate
  // ========================================================================
  describe("reviewsUpdate", () => {
    it("Debería retornar 400 si no se envía ni text ni rating", async () => {
      mockRequest.params = { id: validObjectId };
      mockRequest.body = emptyReviewUpdateBody; // Body vacío

      await reviewsUpdate(mockRequest as Request, mockResponse as Response);

      expect(responseStatusMock).toHaveBeenCalledWith(400);
      expect(responseJsonMock).toHaveBeenCalledWith({
        message: "Body de la reseña inválido",
      });
    });

    it("Debería retornar 404 si la reseña a actualizar no existe", async () => {
      mockRequest.params = { id: validObjectId };
      mockRequest.body = reviewUpdateTextBody;

      // Simulamos que findByIdAndUpdate devuelve null
      (Review.findByIdAndUpdate as jest.Mock).mockReturnValue(
        mockExecResolved(null),
      );

      await reviewsUpdate(mockRequest as Request, mockResponse as Response);

      expect(responseStatusMock).toHaveBeenCalledWith(404);
      expect(responseJsonMock).toHaveBeenCalledWith({
        message: "Comentario no existe",
      });
    });

    it("Debería retornar 200 y la reseña actualizada", async () => {
      mockRequest.params = { id: validObjectId };
      mockRequest.body = reviewUpdateRatingBody; // Solo actualizamos rating

      (Review.findByIdAndUpdate as jest.Mock).mockReturnValue(
        mockExecResolved(mockUpdatedReview),
      );

      await reviewsUpdate(mockRequest as Request, mockResponse as Response);

      expect(Review.findByIdAndUpdate).toHaveBeenCalledWith(
        validObjectId,
        { $set: reviewUpdateRatingBody }, // Verificamos que construyó bien el $set condicional
        { new: true },
      );
      expect(responseStatusMock).toHaveBeenCalledWith(200);
      expect(responseJsonMock).toHaveBeenCalledWith(mockUpdatedReview);
    });
  });

  // ========================================================================
  // DELETE /api/reviews/:id -> reviewsDelete
  // ========================================================================
  describe("reviewsDelete", () => {
    it("Debería retornar 400 si el ID de la reseña tiene un formato inválido", async () => {
      mockRequest.params = { id: "no-es-un-objectid" };

      await reviewsDelete(mockRequest as Request, mockResponse as Response);

      expect(responseStatusMock).toHaveBeenCalledWith(400);
      expect(responseJsonMock).toHaveBeenCalledWith({
        message: "Invalid Review ID",
      });
    });

    it("Debería retornar 404 si se intenta borrar una reseña que no existe", async () => {
      mockRequest.params = { id: validObjectId };

      // Simulamos que findByIdAndDelete no encuentra nada
      (Review.findByIdAndDelete as jest.Mock).mockReturnValue(
        mockExecResolved(null),
      );

      await reviewsDelete(mockRequest as Request, mockResponse as Response);

      expect(responseStatusMock).toHaveBeenCalledWith(404);
      // Asumo que tu controlador envía un mensaje de "Comentario no existe" al igual que en update
      // Si el mensaje es distinto, ajusta el string aquí.
    });

    it("Debería eliminar la reseña correctamente", async () => {
      mockRequest.params = { id: validObjectId };

      const mockDeletedReview = { _id: validObjectId, text: "Para borrar" };

      (Review.findByIdAndDelete as jest.Mock).mockReturnValue(
        mockExecResolved(mockDeletedReview),
      );

      await reviewsDelete(mockRequest as Request, mockResponse as Response);

      expect(Review.findByIdAndDelete).toHaveBeenCalledWith(validObjectId);
      expect(responseStatusMock).toHaveBeenCalledWith(204);
      expect(responseSendMock).toHaveBeenCalled();
    });
  });
});
