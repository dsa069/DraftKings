import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReview extends Document {
  user: mongoose.Types.ObjectId;   // Referencia Relacional 1:N con Users
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
    coordinates: { type: [Number], required: true }
  },
  created_at: { type: Date, default: Date.now }
});

const Review: Model<IReview> = mongoose.model<IReview>("Review", reviewSchema);
export default Review;