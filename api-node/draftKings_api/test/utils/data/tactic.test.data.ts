export type TacticPositionsMap = Record<string, string | null>;

export interface TacticAiRecommendationResponse {
  message: string;
  recommendations: Record<string, string>;
}

export const invalidTacticRequestBody = {
  randomKey: "algo",
};

export const emptyTacticPositionsBody = {
  positions: {},
};

export const validTacticPositions = {
  GK: "Courtois",
  ST: null,
} satisfies TacticPositionsMap;

export const fullTacticPositions = {
  GK: "Courtois",
  ST: "Benzema",
} satisfies TacticPositionsMap;

export const singleEmptyTacticPositions = {
  ST: null,
} satisfies TacticPositionsMap;

export const unitAiTacticResponse = {
  message: "Te falta un delantero.",
  recommendations: { ST: "Haaland" },
} satisfies TacticAiRecommendationResponse;

export const integrationAiTacticResponse = {
  message: "Te falta un buen delantero centro para rematar centros.",
  recommendations: { ST: "Erling Haaland" },
} satisfies TacticAiRecommendationResponse;

export const tacticNoEmptyPositionsErrorMessage = "NO_EMPTY_POSITIONS";

export const tacticServiceErrorMessage = "AI_SERVICE_ERROR";
