// draftKings_api/services/newsService.ts
import { INews } from "../models/news";

export class NewsService {
  // Leemos la URL del servicio externo desde el .env
  private corbaUrl = process.env.URL_CORBA_NEWS || "";

  async getAllNews(): Promise<INews[]> {
    try {
      // Ejemplo real: const response = await axios.get(`${this.corbaUrl}`); return response.data;
      return [];
    } catch (error: any) {
      if (this.isConnectionError(error)) {
        // Adjuntamos la causa original del error para que el linter no se queje y guardar la traza
        throw new Error("CORBA_UNAVAILABLE", { cause: error });
      }
      throw new Error("INTERNAL_ERROR", { cause: error });
    }
  }

  async getNewsById(id: number): Promise<INews> {
    try {
      // Usamos el 'id' en un log para evitar el error del linter y ayudar al debug
      console.log(
        `[NewsService] Buscando noticia con ID: ${id} en ${this.corbaUrl}`,
      );

      // Ejemplo real:
      // const response = await axios.get(`${this.corbaUrl}/${id}`);
      // const news = response.data;

      const news = null; // Simulación para que lance el NOT_FOUND
      if (!news) {
        // Aquí no hay "cause" porque es un error lógico nuestro, no una excepción capturada
        throw new Error("NOT_FOUND");
      }
      return news;
    } catch (error: any) {
      if (error.message === "NOT_FOUND") throw error;
      if (this.isConnectionError(error))
        throw new Error("CORBA_UNAVAILABLE", { cause: error });
      throw new Error("INTERNAL_ERROR", { cause: error });
    }
  }

  async createNews(newsData: Partial<INews>): Promise<INews> {
    try {
      // Ejemplo real: const response = await axios.post(`${this.corbaUrl}`, newsData);
      return newsData as INews;
    } catch (error: any) {
      if (this.isConnectionError(error))
        throw new Error("CORBA_UNAVAILABLE", { cause: error });
      throw new Error("INTERNAL_ERROR", { cause: error });
    }
  }

  // Método auxiliar para detectar si el error es de conexión/disponibilidad
  private isConnectionError(error: any): boolean {
    return (
      error.message?.includes("timeout") ||
      error.message?.includes("network") ||
      error.code === "ECONNREFUSED" ||
      error.response?.status === 503
    );
  }
}
