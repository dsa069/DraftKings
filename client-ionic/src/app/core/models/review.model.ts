export interface Review {
  id: string;
  nombre: string;
  equipo: string;
  imagenUrl: string;
  fechaAlta: Date;
  coordenadas?: {
    lat: number;
    lng: number;
  };
}
