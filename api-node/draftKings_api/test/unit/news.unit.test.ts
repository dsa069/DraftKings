import { Request, Response } from "express";
import {
  newsCreate,
  newsReadAll,
  newsReadOne,
} from "../../controllers/newsController";
import { NewsService } from "../../services/newsService";
import {
  invalidNewsCreateBody,
  mappedNewsItem,
  newsListResult,
  validNewsCreateBody,
} from "../utils/data/news.test.data";
import { createExpressMockContext } from "../utils/helpers/expressMock.helper";

jest.mock("../../services/newsService");

describe("NewsController (Pruebas Unitarias)", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseJsonMock: jest.Mock;
  let responseStatusMock: jest.Mock;

  beforeEach(() => {
    const ctx = createExpressMockContext({ params: {}, body: {} });
    mockRequest = ctx.req;
    mockResponse = ctx.res;
    responseJsonMock = ctx.jsonMock;
    responseStatusMock = ctx.statusMock;

    jest.clearAllMocks();
  });

  describe("newsReadAll", () => {
    it("Debería retornar 200 y el listado de noticias", async () => {
      (NewsService.prototype.getAllNews as jest.Mock).mockResolvedValue(
        newsListResult,
      );

      await newsReadAll(mockRequest as Request, mockResponse as Response);

      expect(responseStatusMock).toHaveBeenCalledWith(200);
      expect(responseJsonMock).toHaveBeenCalledWith(newsListResult);
    });

    it("Debería retornar 503 cuando CORBA no está disponible", async () => {
      (NewsService.prototype.getAllNews as jest.Mock).mockRejectedValue(
        new Error("CORBA_UNAVAILABLE"),
      );

      await newsReadAll(mockRequest as Request, mockResponse as Response);

      expect(responseStatusMock).toHaveBeenCalledWith(503);
      expect(responseJsonMock).toHaveBeenCalledWith({
        message: "Servicio externo de noticias no disponible.",
      });
    });
  });

  describe("newsReadOne", () => {
    it("Debería retornar 400 cuando no llega el id", async () => {
      mockRequest.params = {};

      await newsReadOne(mockRequest as Request, mockResponse as Response);

      expect(responseStatusMock).toHaveBeenCalledWith(400);
      expect(responseJsonMock).toHaveBeenCalledWith({
        message: "El ID es obligatorio.",
      });
    });

    it("Debería retornar 400 si el id no es numérico", async () => {
      mockRequest.params = { id: "abc" };

      await newsReadOne(mockRequest as Request, mockResponse as Response);

      expect(responseStatusMock).toHaveBeenCalledWith(400);
      expect(responseJsonMock).toHaveBeenCalledWith({
        message: "El ID de la noticia debe ser válido (numérico).",
      });
    });

    it("Debería retornar 404 cuando la noticia no existe", async () => {
      mockRequest.params = { id: "1" };
      (NewsService.prototype.getNewsById as jest.Mock).mockRejectedValue(
        new Error("NOT_FOUND"),
      );

      await newsReadOne(mockRequest as Request, mockResponse as Response);

      expect(responseStatusMock).toHaveBeenCalledWith(404);
      expect(responseJsonMock).toHaveBeenCalledWith({
        message: "Noticia no encontrada.",
      });
    });

    it("Debería retornar 200 cuando la noticia existe", async () => {
      mockRequest.params = { id: "1" };
      (NewsService.prototype.getNewsById as jest.Mock).mockResolvedValue(
        mappedNewsItem,
      );

      await newsReadOne(mockRequest as Request, mockResponse as Response);

      expect(NewsService.prototype.getNewsById).toHaveBeenCalledWith(1);
      expect(responseStatusMock).toHaveBeenCalledWith(200);
      expect(responseJsonMock).toHaveBeenCalledWith(mappedNewsItem);
    });
  });

  describe("newsCreate", () => {
    it("Debería retornar 400 cuando faltan campos obligatorios", async () => {
      mockRequest.body = invalidNewsCreateBody;

      await newsCreate(mockRequest as Request, mockResponse as Response);

      expect(responseStatusMock).toHaveBeenCalledWith(400);
      expect(responseJsonMock).toHaveBeenCalledWith({
        message:
          "Body inválido. Faltan campos obligatorios (titulo, descripcion, jugador).",
      });
    });

    it("Debería retornar 201 al crear noticia", async () => {
      mockRequest.body = validNewsCreateBody;
      (NewsService.prototype.createNews as jest.Mock).mockResolvedValue(
        mappedNewsItem,
      );

      await newsCreate(mockRequest as Request, mockResponse as Response);

      expect(NewsService.prototype.createNews).toHaveBeenCalledWith(
        validNewsCreateBody,
      );
      expect(responseStatusMock).toHaveBeenCalledWith(201);
      expect(responseJsonMock).toHaveBeenCalledWith(mappedNewsItem);
    });

    it("Debería retornar 500 en error interno no controlado", async () => {
      mockRequest.body = validNewsCreateBody;
      (NewsService.prototype.createNews as jest.Mock).mockRejectedValue(
        new Error("INTERNAL_ERROR"),
      );

      await newsCreate(mockRequest as Request, mockResponse as Response);

      expect(responseStatusMock).toHaveBeenCalledWith(500);
      expect(responseJsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Error interno al comunicarse con el sistema de noticias.",
          error: "INTERNAL_ERROR",
        }),
      );
    });
  });
});
