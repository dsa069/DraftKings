import axios from "axios";
import { NewsService } from "../../services/newsService";
import {
  corbaCreateOkResponse,
  corbaCreateValidationErrorResponse,
  corbaListEmptyResponse,
  corbaListErrorResponse,
  corbaListOkResponse,
  corbaReadNotFoundResponse,
  corbaReadOkResponse,
  mappedNewsItem,
  newsListResult,
  validNewsCreateBody,
  validNewsCreateBodyWithoutDate,
} from "../utils/data/news.test.data";

jest.mock("axios");

describe("NewsService (Pruebas Unitarias)", () => {
  let newsService: NewsService;

  beforeEach(() => {
    newsService = new NewsService();
    jest.clearAllMocks();
  });

  describe("getAllNews()", () => {
    it("Debería mapear las noticias de CORBA al DTO interno", async () => {
      (axios.get as jest.Mock).mockResolvedValue(corbaListOkResponse);

      const result = await newsService.getAllNews();

      expect(result).toEqual(newsListResult);
      expect(axios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: { action: "Obtener todas", format: "json" },
        }),
      );
    });

    it("Debería devolver array vacío si CORBA responde buffer vacío", async () => {
      (axios.get as jest.Mock).mockResolvedValue(corbaListEmptyResponse);

      await expect(newsService.getAllNews()).resolves.toEqual([]);
    });

    it("Debería lanzar INTERNAL_ERROR en error funcional de CORBA", async () => {
      (axios.get as jest.Mock).mockResolvedValue(corbaListErrorResponse);

      await expect(newsService.getAllNews()).rejects.toThrow("INTERNAL_ERROR");
    });

    it("Debería lanzar CORBA_UNAVAILABLE en error de conexión", async () => {
      (axios.get as jest.Mock).mockRejectedValue(new Error("network timeout"));

      await expect(newsService.getAllNews()).rejects.toThrow(
        "CORBA_UNAVAILABLE",
      );
    });
  });

  describe("getNewsById()", () => {
    it("Debería retornar una noticia mapeada por id", async () => {
      (axios.post as jest.Mock).mockResolvedValue(corbaReadOkResponse);

      const result = await newsService.getNewsById(1);

      expect(result).toEqual(mappedNewsItem);
      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(URLSearchParams),
        expect.objectContaining({
          headers: {
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }),
      );
    });

    it("Debería lanzar NOT_FOUND cuando CORBA responde ok=false", async () => {
      (axios.post as jest.Mock).mockResolvedValue(corbaReadNotFoundResponse);

      await expect(newsService.getNewsById(999)).rejects.toThrow("NOT_FOUND");
    });

    it("Debería lanzar CORBA_UNAVAILABLE en ECONNREFUSED", async () => {
      (axios.post as jest.Mock).mockRejectedValue({ code: "ECONNREFUSED" });

      await expect(newsService.getNewsById(1)).rejects.toThrow(
        "CORBA_UNAVAILABLE",
      );
    });
  });

  describe("createNews()", () => {
    it("Debería crear noticia y enviar etiquetas como string separado por coma", async () => {
      (axios.post as jest.Mock).mockResolvedValue(corbaCreateOkResponse);

      const result = await newsService.createNews(validNewsCreateBody);

      const axiosCallBody = (axios.post as jest.Mock).mock.calls[0][1];

      expect(result).toEqual(
        expect.objectContaining({
          fecha: "31/05/2026",
          jugador: "Lamine Yamal",
          titulo: "Nuevo talento en ascenso",
        }),
      );
      expect(axiosCallBody).toBeInstanceOf(URLSearchParams);
      expect(String(axiosCallBody)).toContain("etiquetas=fcb%2Cpromesa");
    });

    it("Debería asignar fecha por defecto cuando no se envía", async () => {
      (axios.post as jest.Mock).mockResolvedValue(corbaCreateOkResponse);

      const result = await newsService.createNews(
        validNewsCreateBodyWithoutDate,
      );

      expect(result.fecha).toBeDefined();
      expect(result.fecha).toMatch(/^\d{1,2}\/\d{1,2}\/\d{4}$/);
    });

    it("Debería propagar VALIDATION_ERROR cuando CORBA rechaza datos", async () => {
      (axios.post as jest.Mock).mockResolvedValue(
        corbaCreateValidationErrorResponse,
      );

      await expect(newsService.createNews(validNewsCreateBody)).rejects.toThrow(
        "VALIDATION_ERROR|La descripcion es demasiado corta",
      );
    });

    it("Debería lanzar CORBA_UNAVAILABLE cuando el externo devuelve 503", async () => {
      (axios.post as jest.Mock).mockRejectedValue({
        response: { status: 503 },
      });

      await expect(newsService.createNews(validNewsCreateBody)).rejects.toThrow(
        "CORBA_UNAVAILABLE",
      );
    });
  });
});
