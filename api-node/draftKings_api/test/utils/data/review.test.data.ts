export interface ReviewCreateBody {
  author?: string;
  text: string;
  rating: number;
  latitude?: number;
  longitude?: number;
}

export interface ReviewUpdateBody {
  text?: string;
  rating?: number;
}

export interface ReviewSeed {
  user: string;
  player: string;
  author: string;
  text: string;
  rating: number;
  coords: {
    type: "Point";
    coordinates: [number, number];
  };
}

export const validReviewBody = {
  author: "Test Author",
  text: "Excelente jugador, gran visión de juego.",
  rating: 5,
  latitude: 40.4168,
  longitude: -3.7038,
} satisfies ReviewCreateBody;

export const reviewBodyWithoutAuthor = {
  text: "Sin autor",
  rating: 4,
  latitude: 0,
  longitude: 0,
} satisfies ReviewCreateBody;

export const reviewCreateMissingRatingBody = {
  text: "Sin rating",
} satisfies Partial<ReviewCreateBody>;

export const reviewUpdateTextBody = {
  text: "Texto editado",
} satisfies ReviewUpdateBody;

export const reviewUpdateRatingBody = {
  rating: 4,
} satisfies ReviewUpdateBody;

export const reviewUpdateFullBody = {
  text: "Texto editado",
  rating: 5,
} satisfies ReviewUpdateBody;

export const emptyReviewUpdateBody = {} satisfies ReviewUpdateBody;

export const mockReviewList = [{ text: "Gran jugador", rating: 5 }];

export const mockSavedReview = {
  _id: "review-id",
  text: "Gran partido",
  rating: 5,
};

export const mockUpdatedReview = {
  _id: "review-id",
  text: "Viejo",
  rating: 4,
};

export const reviewDefaultCoords = {
  type: "Point" as const,
  coordinates: [0, 0] as [number, number],
};

export const integrationReviewSeed = {
  author: "Fan Original",
  text: "Buen partido",
  rating: 3,
  coords: {
    type: "Point" as const,
    coordinates: [0, 0] as [number, number],
  },
};

export const integrationReviewCreateBody = {
  author: "Test Author",
  text: "Excelente jugador, gran visión de juego.",
  rating: 5,
  latitude: 40.4168,
  longitude: -3.7038,
} satisfies ReviewCreateBody;

export const integrationReviewBodyWithoutAuthor = {
  text: "Sin autor",
  rating: 4,
  latitude: 0,
  longitude: 0,
} satisfies ReviewCreateBody;
