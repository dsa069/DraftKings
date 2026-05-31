import type { INews } from "../../../models/news";

export interface NewsCreateBody {
  fecha?: string;
  jugador: string;
  interes?: string;
  titulo: string;
  descripcion: string;
  etiquetas?: string[] | string;
}

export const validNewsCreateBody = {
  fecha: "31/05/2026",
  jugador: "Lamine Yamal",
  interes: "alta",
  titulo: "Nuevo talento en ascenso",
  descripcion: "El jugador sigue destacando jornada tras jornada.",
  etiquetas: ["fcb", "promesa"],
} satisfies NewsCreateBody;

export const validNewsCreateBodyWithoutDate = {
  jugador: "Pedri",
  interes: "media",
  titulo: "Regreso al once",
  descripcion: "El mediocampista vuelve a ser titular.",
  etiquetas: ["lesion", "alineacion"],
} satisfies NewsCreateBody;

export const invalidNewsCreateBody = {
  titulo: "Faltan campos",
} satisfies Partial<NewsCreateBody>;

export const mappedNewsItem = {
  id: 1,
  fecha: "31/05/2026",
  jugador: "Lamine Yamal",
  interes: "alta",
  titulo: "Nuevo talento en ascenso",
  descripcion: "El jugador sigue destacando jornada tras jornada.",
  etiquetas: ["fcb", "promesa"],
} satisfies INews;

export const mappedSecondNewsItem = {
  id: 2,
  fecha: "31/05/2026",
  jugador: "Pedri",
  interes: "media",
  titulo: "Regreso al once",
  descripcion: "El mediocampista vuelve a ser titular.",
  etiquetas: ["lesion", "alineacion"],
} satisfies INews;

export const newsListResult = [mappedNewsItem, mappedSecondNewsItem];

export const corbaListOkResponse = {
  data: {
    ok: true,
    noticias: [
      {
        indice: 1,
        fecha: "31/05/2026",
        jugador: "Lamine Yamal",
        interes: "alta",
        titulo: "Nuevo talento en ascenso",
        descripcion: "El jugador sigue destacando jornada tras jornada.",
        etiquetas: ["fcb", "promesa"],
      },
      {
        indice: 2,
        fecha: "31/05/2026",
        jugador: "Pedri",
        interes: "media",
        titulo: "Regreso al once",
        descripcion: "El mediocampista vuelve a ser titular.",
        etiquetas: ["lesion", "alineacion"],
      },
    ],
  },
};

export const corbaListEmptyResponse = {
  data: {
    ok: false,
    error: "buffer vacio",
  },
};

export const corbaListErrorResponse = {
  data: {
    ok: false,
    error: "error inesperado en CORBA",
  },
};

export const corbaReadOkResponse = {
  data: {
    ok: true,
    noticia: {
      indice: 1,
      fecha: "31/05/2026",
      jugador: "Lamine Yamal",
      interes: "alta",
      titulo: "Nuevo talento en ascenso",
      descripcion: "El jugador sigue destacando jornada tras jornada.",
      etiquetas: ["fcb", "promesa"],
    },
  },
};

export const corbaReadNotFoundResponse = {
  data: {
    ok: false,
    error: "No existe noticia",
  },
};

export const corbaCreateOkResponse = {
  data: {
    ok: true,
    message: "Noticia enviada",
  },
};

export const corbaCreateValidationErrorResponse = {
  data: {
    ok: false,
    error: "La descripcion es demasiado corta",
  },
};
