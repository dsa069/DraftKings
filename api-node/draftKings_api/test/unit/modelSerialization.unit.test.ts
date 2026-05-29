import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import Player from "../../models/player";
import Review from "../../models/review";
import { User } from "../../models/user";
import {
  modelSerializationPlayerSeed,
  modelSerializationReviewSeed,
  modelSerializationUserSeed,
} from "../utils/data/model.test.data";

describe("Model serialization (Pruebas Unitarias)", () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Review.deleteMany({});
    await Player.deleteMany({});
    await User.deleteMany({});
  });

  it("Player.toJSON debería mapear id, aplanar coords y formatear birthdate", async () => {
    const player = await Player.create({
      ...modelSerializationPlayerSeed,
    });

    const json = player.toJSON() as Record<string, unknown>;

    expect(json.id).toBeDefined();
    expect(json.longitude).toBeCloseTo(12.34);
    expect(json.latitude).toBeCloseTo(56.78);
    expect(json.birthdate).toBe("2002-01-31");
    expect(json._id).toBeUndefined();
    expect(json.coords).toBeUndefined();
    expect(json.__v).toBeUndefined();
  });

  it("Review.toJSON debería exponer user_id, aplanar coords y ocultar refs internas", async () => {
    const user = await User.create({
      ...modelSerializationUserSeed,
    });

    const player = await Player.create({
      ...modelSerializationPlayerSeed,
      coords: { type: "Point", coordinates: [1, 2] },
    });

    const review = await Review.create({
      user: user._id,
      player: player._id,
      ...modelSerializationReviewSeed,
    });

    const json = review.toJSON() as Record<string, unknown>;

    expect(json.id).toBeDefined();
    expect(String(json.user_id)).toBe(String(user._id));
    expect(json.longitude).toBeCloseTo(-3.7);
    expect(json.latitude).toBeCloseTo(40.4);
    expect(json.user).toBeUndefined();
    expect(json.player).toBeUndefined();
    expect(json.coords).toBeUndefined();
    expect(json._id).toBeUndefined();
  });
});
