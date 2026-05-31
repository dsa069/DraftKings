// draftKings_api/models/news.ts

export interface INews {
  id: number;
  fecha: string;
  jugador: string;
  interes: string;
  titulo: string;
  descripcion: string;
  etiquetas: string[];
}
