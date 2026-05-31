import type { INews } from "../../models/news";
import { mappedNewsItem } from "../utils/data/news.test.data";

const asNews = (news: INews): INews => news;

describe("News DTO model (Pruebas Unitarias)", () => {
  it("Debería aceptar un objeto que cumpla con la interfaz INews", () => {
    const news = asNews({
      ...mappedNewsItem,
    });

    expect(news.id).toBe(1);
    expect(news.titulo).toBe("Nuevo talento en ascenso");
    expect(news.etiquetas).toEqual(["fcb", "promesa"]);
  });

  it("Debería mantener etiquetas como arreglo de strings", () => {
    const news = asNews({
      ...mappedNewsItem,
      etiquetas: ["mercado", "analisis"],
    });

    expect(Array.isArray(news.etiquetas)).toBe(true);
    expect(news.etiquetas[0]).toBe("mercado");
  });
});
