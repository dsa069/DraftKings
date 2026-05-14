export interface User {
  id: string;
  nombre: string;
  email: string;
  fechaAlta: Date;
  coordenadas?: {
    lat: number;
    lng: number;
  };
}
