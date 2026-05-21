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
    coordinates: { type: [Number], required: true }, // [longitud, latitud] según estándar GeoJSON
  },
  created_at: { type: Date, default: Date.now },
});

// Índice geoespacial para la geolocalización de estadios/jugadores
playerSchema.index({ coords: "2dsphere" });

// =========================================================================
// CONFIGURACIÓN DE TRANSFORMACIÓN TOJSON (Mejor Práctica)
// =========================================================================
playerSchema.set("toJSON", {
  transform: (doc: any, ret: any) => {
    const obj: any = ret;

    // 1. Mapeamos de forma limpia el _id de Mongo a un id plano
    obj.id = obj._id;

    // 2. Extraemos las coordenadas de GeoJSON y las aplanamos para cumplir tu contrato API
    // En GeoJSON estándar, coordinates es [longitud, latitud]
    if (obj.coords && obj.coords.coordinates) {
      obj.longitude = obj.coords.coordinates[0];
      obj.latitude = obj.coords.coordinates[1];
    }

    // 3. Formateamos la fecha del birthdate al estándar de formulario plano YYYY-MM-DD
    if (obj.birthdate) {
      obj.birthdate = new Date(obj.birthdate).toISOString().split("T")[0];
    }

    // 4. Eliminamos las propiedades originales y campos internos de Mongo
    // para evitar datos duplicados o basura en la respuesta JSON final
    delete obj._id;
    delete obj.__v;
    delete obj.coords;

    return obj;
  },
});

const Player: Model<IPlayer> = mongoose.model<IPlayer>("Player", playerSchema);
export default Player;
