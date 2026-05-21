import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPlayer extends Document {
  name: string;
  firstName?: string;
  lastName?: string;
  age?: number;
  birthdate?: Date;
  nationality?: string;
  height?: number;
  weight?: number;
  number?: number;
  team?: string;
  league?: string;
  position?: string;
  photoUrl?: string;
  coords: { type: string; coordinates: number[] }; // Formato GeoJSON compatible con 2dsphere
  created_at: Date;
}

const playerSchema = new Schema<IPlayer>({
  name: { type: String, required: true },
  firstName: String,
  lastName: String,
  age: { type: Number, min: 0, max: 99 },
  birthdate: Date,
  nationality: String,
  height: Number,
  weight: Number,
  number: Number,
  team: String,
  league: String,
  position: String,
  photoUrl: String,
  coords: {
    type: { type: String, default: "Point" },
    coordinates: { type: [Number], required: true } // [longitud, latitud] según estándar GeoJSON
  },
  created_at: { type: Date, default: Date.now }
});

// Índice geoespacial para la geolocalización de estadios/jugadores
playerSchema.index({ coords: "2dsphere" });

const Player: Model<IPlayer> = mongoose.model<IPlayer>("Player", playerSchema);
export default Player;