export interface News {
  id?: string | number;
  fecha: string; // Formato "DD/MM/AAAA" recibido desde la API
  jugador: string;
  interes: 'alta' | 'media' | 'baja' | string;
  titulo: string;
  descripcion: string;
  etiquetas: string[];
}
