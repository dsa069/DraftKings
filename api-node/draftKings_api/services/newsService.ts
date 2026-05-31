import axios from "axios";
import { INews } from "../models/news";

export class NewsService {
  // Leemos la URL del servicio externo desde el .env, con fallback al localhost del ejemplo
  private corbaUrl =
    process.env.URL_CORBA_NEWS ||
    "http://localhost:8070/DK_News_Prod_Cons/servlet";

  async getAllNews(): Promise<INews[]> {
    try {
      const response = await axios.get(this.corbaUrl, {
        params: { action: "Obtener todas", format: "json" },
      });

      const data = response.data;

      // Si el buffer está vacío, CORBA devuelve ok: false
      if (!data.ok) {
        if (data.error && data.error.includes("vacio")) {
          return [];
        }
        throw new Error(`CORBA_ERROR: ${data.error}`);
      }

      // Mapeamos el 'indice' de CORBA al 'id' de nuestro DTO
      return data.noticias.map((n: any) => ({
        id: n.indice,
        fecha: n.fecha,
        jugador: n.jugador,
        interes: n.interes,
        titulo: n.titulo,
        descripcion: n.descripcion,
        etiquetas: n.etiquetas,
      }));
    } catch (error: any) {
      if (this.isConnectionError(error)) {
        throw new Error("CORBA_UNAVAILABLE", { cause: error });
      }
      throw new Error("INTERNAL_ERROR", { cause: error });
    }
  }

  async getNewsById(id: number): Promise<INews> {
    try {
      console.log(
        `[NewsService] Buscando noticia con índice: ${id} en ${this.corbaUrl}`,
      );

      const formData = new URLSearchParams();
      formData.append("action", "Leer en");
      formData.append("indice", id.toString());

      const response = await axios.post(this.corbaUrl, formData, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const data = response.data;

      if (!data.ok) {
        throw new Error("NOT_FOUND");
      }

      const n = data.noticia;
      return {
        id: n.indice,
        fecha: n.fecha,
        jugador: n.jugador,
        interes: n.interes,
        titulo: n.titulo,
        descripcion: n.descripcion,
        etiquetas: n.etiquetas,
      };
    } catch (error: any) {
      if (error.message === "NOT_FOUND") throw error;
      if (this.isConnectionError(error)) {
        throw new Error("CORBA_UNAVAILABLE", { cause: error });
      }
      throw new Error("INTERNAL_ERROR", { cause: error });
    }
  }

  async createNews(newsData: Partial<INews>): Promise<INews> {
    try {
      const formData = new URLSearchParams();
      formData.append("action", "Enviar");

      // Asignamos fecha actual en formato DD/MM/YYYY si no viene
      const fecha = newsData.fecha || new Date().toLocaleDateString("es-ES");
      formData.append("fecha", fecha);
      formData.append("jugador", newsData.jugador || "");
      formData.append("interes", newsData.interes || "media");
      formData.append("titulo", newsData.titulo || "");
      formData.append("descripcion", newsData.descripcion || "");

      // Convertimos el array de etiquetas en un string (CORBA lo espera plano si viene del form)
      const etiquetas = Array.isArray(newsData.etiquetas)
        ? newsData.etiquetas.join(",")
        : newsData.etiquetas || "";
      formData.append("etiquetas", etiquetas);

      const response = await axios.post(this.corbaUrl, formData, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const data = response.data;

      // Manejar errores de validación de CORBA (ej. descripción corta)
      if (!data.ok) {
        throw new Error(`VALIDATION_ERROR|${data.error}`);
      }

      // Si todo va bien, devolvemos el objeto con sus datos base
      // (el ID real lo asigna CORBA internamente, si lo necesitas en el retorno
      // idealmente deberías volver a consultar, pero podemos devolver el partial temporalmente)
      return { ...newsData, fecha } as INews;
    } catch (error: any) {
      if (
        typeof error?.message === "string" &&
        error.message.startsWith("VALIDATION_ERROR")
      ) {
        throw error;
      }
      if (this.isConnectionError(error)) {
        throw new Error("CORBA_UNAVAILABLE", { cause: error });
      }
      throw new Error("INTERNAL_ERROR", { cause: error });
    }
  }

  private isConnectionError(error: any): boolean {
    return (
      error.message?.includes("timeout") ||
      error.message?.includes("network") ||
      error.code === "ECONNREFUSED" ||
      error.response?.status === 503
    );
  }
}
