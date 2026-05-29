import mongoose from "mongoose";

export const modelPlayerCoords = {
  type: "Point" as const,
  coordinates: [2.12, 41.38] as [number, number],
};

export const modelPlayerSeed = {
  name: "Lamine Yamal",
  birthdate: new Date("2007-07-13T00:00:00.000Z"),
  coords: modelPlayerCoords,
};

export const modelSerializationPlayerSeed = {
  name: "Serializado",
  birthdate: new Date("2002-01-31T00:00:00.000Z"),
  coords: {
    type: "Point" as const,
    coordinates: [12.34, 56.78] as [number, number],
  },
};

export const modelPlayerMinimalSeed = {
  name: "Sin Fecha",
  coords: {
    type: "Point" as const,
    coordinates: [0, 0] as [number, number],
  },
};

export const modelPlayerMissingCoordsSeed = {
  name: "Sin coords",
};

export const modelPlayerInvalidSeed = {};

export const modelReviewUserId = new mongoose.Types.ObjectId();
export const modelReviewPlayerId = new mongoose.Types.ObjectId();

export const modelReviewCoords = {
  type: "Point" as const,
  coordinates: [2.12, 41.38] as [number, number],
};

export const modelReviewSeed = {
  user: modelReviewUserId,
  player: modelReviewPlayerId,
  author: "Tester",
  text: "Buen jugador",
  rating: 5,
  coords: modelReviewCoords,
};

export const modelSerializationReviewSeed = {
  author: "Autor",
  text: "Texto",
  rating: 4,
  coords: {
    type: "Point" as const,
    coordinates: [-3.7, 40.4] as [number, number],
  },
};

export const modelReviewLongSeed = {
  user: modelReviewUserId,
  player: modelReviewPlayerId,
  author: "Tester",
  text: "x".repeat(1001),
  rating: 6,
  coords: modelReviewCoords,
};

export const modelReviewMissingFieldsSeed = {
  coords: {
    type: "Point" as const,
  },
};

export const modelReviewWithoutCoordsSeed = {
  user: modelReviewUserId,
  player: modelReviewPlayerId,
  author: "Tester",
  text: "Sin coords",
  rating: 4,
};

export const modelUserSeed = {
  firebaseUid: "firebase-uid",
  email: "user@example.com",
};

export const modelSerializationUserSeed = {
  firebaseUid: "uid-model-test",
  email: "model-test@example.com",
  userName: "ModelUser",
};

export const modelUserMissingRequiredFieldsSeed = {
  userName: "Tester",
};
