export interface Player {
  id?: number;
  name: string;
  firstName?: string;
  lastName?: string;
  age?: number;
  birthdate?: string | Date;
  nationality?: string;
  height?: number;
  weight?: number;
  number?: number;
  team?: string;
  league?: string;
  position?: string;
  photoUrl?: string;
  latitude: number;
  longitude: number;
  created_at?: string | Date;
}