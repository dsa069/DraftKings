import type mongoose from "mongoose";
import type { IPlayer } from "../../../models/player";
import Player from "../../../models/player";
import type { IReview } from "../../../models/review";
import Review from "../../../models/review";

export interface PlayerSeedInput {
  name: string;
  coords: {
    type: "Point";
    coordinates: [number, number];
  };
}

export interface ReviewSeedInput {
  user: mongoose.Types.ObjectId;
  player: mongoose.Types.ObjectId;
  author: string;
  text: string;
  rating: number;
  coords: {
    type: "Point";
    coordinates: [number, number];
  };
}

export const createPlayerDocument = async (
  seed: PlayerSeedInput,
): Promise<IPlayer> => {
  const player = new Player(seed);
  return player.save();
};

export const createReviewDocument = async (
  seed: ReviewSeedInput,
): Promise<IReview> => {
  return Review.create(seed);
};
