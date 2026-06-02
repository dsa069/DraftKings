// review.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReview extends Document {
  user: mongoose.Types.ObjectId; // Referencia Relacional 1:N con Users
  player: mongoose.Types.ObjectId; // Referencia Relacional 1:N con Player
  author: string;
  text: string;
  rating: number;
  coords: { type: string; coordinates: number[] };
  created_at: Date;
}

const reviewSchema = new Schema<IReview>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  player: { type: Schema.Types.ObjectId, ref: "Player", required: true },
  author: { type: String, required: true },
  text: { type: String, required: true, maxlength: 1000 },
  rating: { type: Number, required: true, min: 0, max: 5 },
  coords: {
    type: { type: String, default: "Point" },
    coordinates: { type: [Number], required: true },
  },
  created_at: { type: Date, default: Date.now },
});

// =========================================================================
// CONFIGURACIÓN DE TRANSFORMACIÓN TOJSON
// =========================================================================
reviewSchema.set("toJSON", {
  transform: (doc: any, ret: any) => {
    const obj: any = ret;

    obj.id = obj._id;
    obj.user_id = obj.user; // Renombramos 'user' a 'user_id' para el JSON final

    if (obj.coords && obj.coords.coordinates) {
      obj.longitude = obj.coords.coordinates[0];
      obj.latitude = obj.coords.coordinates[1];
    }

    delete obj._id;
    delete obj.__v;
    delete obj.coords;
    delete obj.user;
    delete obj.player; // Lo ocultamos para no redundar si lo sacamos desde el jugador

    return obj;
  },
});

const Review: Model<IReview> = mongoose.model<IReview>("Review", reviewSchema);
export default Review;
