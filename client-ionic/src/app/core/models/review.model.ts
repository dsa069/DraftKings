import { User } from './user.model'; // Importa tu interfaz User existente
import { Player } from './player.model';

export interface Review {
  id?: number;
  userId: number | string; // ID o UID de la base de datos interna / Firebase
  user?: User; // Relación opcional cargada por populate/join
  playerId: number;
  player?: Player; // Relación opcional cargada por populate/join
  author: string;
  text: string;
  rating: number; // Validación en frontend: entre 0 y 5
  latitude: number;
  longitude: number;
  created_at?: string | Date;
}
