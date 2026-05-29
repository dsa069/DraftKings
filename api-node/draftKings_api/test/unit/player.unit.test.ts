import { Request, Response } from "express";
import {
  playersCreate,
  playersDelete,
  playersGetExternal,
  playersReadAll,
  playersReadOne,
  playersUpdate,
  playersImport,
} from "../../controllers/playerController";
import Player from "../../models/player";
import { PlayerService } from "../../services/playerService";
import { ApiFootballService } from "../../services/apiFootballService";
import {
  invalidImportPlayers,
  playerImportBatchBody,
  playerImportNotArrayBody,
  playerUpdatePayload,
  playerWithoutRequiredFieldsBody,
  validPlayerBody,
} from "../utils/data/player.test.data";

// 1. Mockeamos las dependencias del controlador
jest.mock("../../models/player");
jest.mock("../../services/playerService");
jest.mock("../../services/apiFootballService");

describe("PlayerController (Pruebas Unitarias)", () => {
  // Helpers para simular los objetos req y res de Express (TypeScript puro)
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseJsonMock: jest.Mock;
  let responseStatusMock: jest.Mock;
  let responseSendMock: jest.Mock;

  beforeEach(() => {
    // Reseteamos los mocks de Express en cada prueba
    responseJsonMock = jest.fn();
    responseSendMock = jest.fn();
    responseStatusMock = jest
      .fn()
      .mockReturnValue({ json: responseJsonMock, send: responseSendMock });

    mockRequest = {};
    mockResponse = {
      status: responseStatusMock,
      json: responseJsonMock,
    };

    jest.clearAllMocks();
  });

  describe("playersReadAll", () => {
    it("Debería retornar 400 si los parámetros de paginación son inválidos", async () => {
      // Inyectamos un query string inválido en la Request falsa
      mockRequest.query = { page: "-1", size: "10" };

      // Llamamos directamente a la función del controlador (Sin SuperTest)
      await playersReadAll(mockRequest as Request, mockResponse as Response);

      // Comprobamos que el controlador respondió adecuadamente
      expect(responseStatusMock).toHaveBeenCalledWith(400);
      expect(responseJsonMock).toHaveBeenCalledWith({
        message: "Parámetros de paginación inválidos",
      });
    });

    it("Debería retornar 200 y paginar correctamente si los parámetros son válidos", async () => {
      mockRequest.query = { page: "0", size: "10", search: "Messi" };

      // Simulamos los encadenamientos de Mongoose (.find().skip().limit().exec())
      const mockExec = jest.fn().mockResolvedValue([{ name: "Lionel Messi" }]);
      const mockLimit = jest.fn().mockReturnValue({ exec: mockExec });
      const mockSkip = jest.fn().mockReturnValue({ limit: mockLimit });

      (Player.countDocuments as jest.Mock).mockResolvedValue(1);
      (Player.find as jest.Mock).mockReturnValue({ skip: mockSkip });

      await playersReadAll(mockRequest as Request, mockResponse as Response);

      // Verificamos la aserción de éxito
      expect(responseStatusMock).toHaveBeenCalledWith(200);
      expect(responseJsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          totalElements: 1,
          content: [{ name: "Lionel Messi" }],
        }),
      );
    });

    it("Debería retornar 500 si ocurre un error en la consulta", async () => {
      mockRequest.query = { page: "0", size: "10" };

      (Player.countDocuments as jest.Mock).mockRejectedValue(
        new Error("db down"),
      );

      await playersReadAll(mockRequest as Request, mockResponse as Response);

      expect(responseStatusMock).toHaveBeenCalledWith(500);
      expect(responseJsonMock).toHaveBeenCalledWith({
        message: "Internal Server Error",
        error: "db down",
      });
    });
  });

  describe("playersReadOne", () => {
    it("Debería retornar 400 si no llega id", async () => {
      mockRequest.params = {};

      await playersReadOne(mockRequest as Request, mockResponse as Response);

      expect(responseStatusMock).toHaveBeenCalledWith(400);
      expect(responseJsonMock).toHaveBeenCalledWith({ message: "Bad Request" });
    });

    it("Debería retornar 404 si el jugador no existe", async () => {
      mockRequest.params = { id: "507f1f77bcf86cd799439011" };

      (Player.findById as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await playersReadOne(mockRequest as Request, mockResponse as Response);

      expect(responseStatusMock).toHaveBeenCalledWith(404);
      expect(responseJsonMock).toHaveBeenCalledWith({ message: "not found" });
    });

    it("Debería retornar 200 con el jugador encontrado", async () => {
      mockRequest.params = { id: "507f1f77bcf86cd799439011" };

      (Player.findById as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: "507f1f77bcf86cd799439011" }),
      });

      await playersReadOne(mockRequest as Request, mockResponse as Response);

      expect(responseStatusMock).toHaveBeenCalledWith(200);
      expect(responseJsonMock).toHaveBeenCalledWith({
        _id: "507f1f77bcf86cd799439011",
      });
    });

    it("Debería retornar 400 si el ID es inválido", async () => {
      mockRequest.params = { id: "bad-id" };

      (Player.findById as jest.Mock).mockReturnValue({
        exec: jest
          .fn()
          .mockRejectedValue(
            Object.assign(new Error("cast"), { name: "CastError" }),
          ),
      });

      await playersReadOne(mockRequest as Request, mockResponse as Response);

      expect(responseStatusMock).toHaveBeenCalledWith(400);
      expect(responseJsonMock).toHaveBeenCalledWith({
        message: "Bad Request: ID inválido",
      });
    });
  });

  describe("playersCreate", () => {
    it("Debería retornar 400 si faltan campos requeridos", async () => {
      mockRequest.body = playerWithoutRequiredFieldsBody;

      await playersCreate(mockRequest as Request, mockResponse as Response);

      expect(responseStatusMock).toHaveBeenCalledWith(400);
      expect(responseJsonMock).toHaveBeenCalledWith({
        message:
          "Body inválido. Faltan campos requeridos: name, latitude, longitude.",
      });
    });

    it("Debería crear el jugador y retornar 201", async () => {
      mockRequest.body = validPlayerBody;

      (PlayerService.prototype.createPlayer as jest.Mock).mockResolvedValue({
        _id: "nuevo-id",
        name: "Jugador Nuevo",
      });

      await playersCreate(mockRequest as Request, mockResponse as Response);

      expect(PlayerService.prototype.createPlayer).toHaveBeenCalledWith(
        mockRequest.body,
      );
      expect(responseStatusMock).toHaveBeenCalledWith(201);
      expect(responseJsonMock).toHaveBeenCalledWith({
        _id: "nuevo-id",
        name: "Jugador Nuevo",
      });
    });
  });

  describe("playersUpdate", () => {
    it("Debería retornar 400 si no llega id", async () => {
      mockRequest.params = {};

      await playersUpdate(mockRequest as Request, mockResponse as Response);

      expect(responseStatusMock).toHaveBeenCalledWith(400);
      expect(responseJsonMock).toHaveBeenCalledWith({ message: "Bad Request" });
    });

    it("Debería retornar 404 si el servicio devuelve NOT_FOUND", async () => {
      mockRequest.params = { id: "507f1f77bcf86cd799439011" };
      mockRequest.body = playerUpdatePayload;

      (
        PlayerService.prototype.updatePlayerPartial as jest.Mock
      ).mockRejectedValue(new Error("NOT_FOUND"));

      await playersUpdate(mockRequest as Request, mockResponse as Response);

      expect(responseStatusMock).toHaveBeenCalledWith(404);
      expect(responseJsonMock).toHaveBeenCalledWith({ message: "not found" });
    });

    it("Debería retornar 200 con el jugador actualizado", async () => {
      mockRequest.params = { id: "507f1f77bcf86cd799439011" };
      mockRequest.body = playerUpdatePayload;

      (
        PlayerService.prototype.updatePlayerPartial as jest.Mock
      ).mockResolvedValue({
        _id: "507f1f77bcf86cd799439011",
        team: "Selección Argentina",
        age: 37,
      });

      await playersUpdate(mockRequest as Request, mockResponse as Response);

      expect(PlayerService.prototype.updatePlayerPartial).toHaveBeenCalledWith(
        "507f1f77bcf86cd799439011",
        playerUpdatePayload,
      );
      expect(responseStatusMock).toHaveBeenCalledWith(200);
      expect(responseJsonMock).toHaveBeenCalledWith({
        _id: "507f1f77bcf86cd799439011",
        team: "Selección Argentina",
        age: 37,
      });
    });
  });

  describe("playersDelete", () => {
    it("Debería retornar 400 si no llega id", async () => {
      mockRequest.params = {};

      await playersDelete(mockRequest as Request, mockResponse as Response);

      expect(responseStatusMock).toHaveBeenCalledWith(400);
      expect(responseJsonMock).toHaveBeenCalledWith({ message: "Bad Request" });
    });

    it("Debería retornar 404 si no encuentra el jugador", async () => {
      mockRequest.params = { id: "507f1f77bcf86cd799439011" };

      (Player.findByIdAndDelete as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await playersDelete(mockRequest as Request, mockResponse as Response);

      expect(responseStatusMock).toHaveBeenCalledWith(404);
      expect(responseJsonMock).toHaveBeenCalledWith({ message: "not found" });
    });

    it("Debería borrar el jugador y retornar 204", async () => {
      mockRequest.params = { id: "507f1f77bcf86cd799439011" };

      (Player.findByIdAndDelete as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: "507f1f77bcf86cd799439011" }),
      });

      await playersDelete(mockRequest as Request, mockResponse as Response);

      expect(responseStatusMock).toHaveBeenCalledWith(204);
      expect(responseSendMock).toHaveBeenCalled();
    });
  });

  describe("playersGetExternal", () => {
    it("Debería retornar 200 con los jugadores externos", async () => {
      mockRequest.query = { search: "Messi" };

      (
        ApiFootballService.prototype.searchPlayers as jest.Mock
      ).mockResolvedValue([{ name: "Lionel Messi" }]);

      await playersGetExternal(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(responseStatusMock).toHaveBeenCalledWith(200);
      expect(responseJsonMock).toHaveBeenCalledWith([{ name: "Lionel Messi" }]);
    });

    it("Debería retornar 503 si la API externa falla", async () => {
      mockRequest.query = { search: "Messi" };

      (
        ApiFootballService.prototype.searchPlayers as jest.Mock
      ).mockRejectedValue(
        Object.assign(new Error("network error"), { isAxiosError: true }),
      );

      await playersGetExternal(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(responseStatusMock).toHaveBeenCalledWith(503);
      expect(responseJsonMock).toHaveBeenCalledWith({
        message:
          "Service Unavailable: Fallo en la comunicación con la API externa.",
      });
    });

    it("Debería retornar 500 para errores inesperados", async () => {
      mockRequest.query = { search: "Messi" };

      (
        ApiFootballService.prototype.searchPlayers as jest.Mock
      ).mockRejectedValue(new Error("boom"));

      await playersGetExternal(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(responseStatusMock).toHaveBeenCalledWith(500);
      expect(responseJsonMock).toHaveBeenCalledWith({
        message: "Internal Server Error",
        error: "boom",
      });
    });
  });

  describe("playersImport", () => {
    it("Debería retornar 400 si el body no es un array", async () => {
      mockRequest.body = playerImportNotArrayBody;

      await playersImport(mockRequest as Request, mockResponse as Response);

      expect(responseStatusMock).toHaveBeenCalledWith(400);
      expect(responseJsonMock).toHaveBeenCalledWith({
        message: "Expected an array of players",
      });
    });

    it("Debería retornar 400 si algún jugador no tiene name, latitud o longitud", async () => {
      mockRequest.body = invalidImportPlayers;

      await playersImport(mockRequest as Request, mockResponse as Response);

      expect(responseStatusMock).toHaveBeenCalledWith(400);
      expect(responseJsonMock).toHaveBeenCalledWith({
        message: expect.stringContaining("Body inválido"),
      });
    });

    it("Debería llamar a apiFootballService y retornar 201 si el array es válido", async () => {
      mockRequest.body = playerImportBatchBody;

      // Simulamos que el servicio externo resuelve correctamente
      (
        ApiFootballService.prototype.importPlayers as jest.Mock
      ).mockResolvedValue(true);

      await playersImport(mockRequest as Request, mockResponse as Response);

      expect(ApiFootballService.prototype.importPlayers).toHaveBeenCalledWith(
        mockRequest.body,
      );
      expect(responseStatusMock).toHaveBeenCalledWith(201);
      expect(responseJsonMock).toHaveBeenCalledWith({
        message: "Players imported successfully",
      });
    });

    it("Debería retornar 500 si el servicio de importación falla", async () => {
      mockRequest.body = playerImportBatchBody;

      (
        ApiFootballService.prototype.importPlayers as jest.Mock
      ).mockRejectedValue(new Error("db error"));

      await playersImport(mockRequest as Request, mockResponse as Response);

      expect(responseStatusMock).toHaveBeenCalledWith(500);
      expect(responseJsonMock).toHaveBeenCalledWith({
        message: "Internal Server Error",
        error: "db error",
      });
    });
  });
});
