const invokeMock = jest.fn();

jest.mock("@langchain/groq", () => ({
  ChatGroq: jest.fn(),
}));

jest.mock("@langchain/core/prompts", () => ({
  PromptTemplate: jest.fn().mockImplementation(() => ({})),
}));

jest.mock("@langchain/core/output_parsers", () => ({
  StructuredOutputParser: {
    fromZodSchema: jest.fn(() => ({
      getFormatInstructions: jest.fn().mockReturnValue("format instructions"),
    })),
  },
}));

jest.mock("@langchain/core/runnables", () => ({
  RunnableSequence: {
    from: jest.fn(() => ({
      invoke: invokeMock,
    })),
  },
}));

import { AiTacticService } from "../../services/aiTacticService";

describe("AiTacticService (Pruebas Unitarias)", () => {
  let aiTacticService: AiTacticService;

  beforeEach(() => {
    invokeMock.mockReset();
    aiTacticService = new AiTacticService();
    jest.clearAllMocks();
  });

  describe("getRecommendations()", () => {
    it("Debería lanzar NO_EMPTY_POSITIONS si no hay huecos", async () => {
      await expect(
        aiTacticService.getRecommendations({ GK: "Courtois" }),
      ).rejects.toThrow("NO_EMPTY_POSITIONS");
    });

    it("Debería invocar la cadena con el contexto correcto y devolver la respuesta parseada", async () => {
      const chainResponse = {
        message: "Based on the current layout, the team needs width.",
        recommendations: { ST: "Haaland" },
      };

      invokeMock.mockResolvedValue(chainResponse);

      const result = await aiTacticService.getRecommendations({
        GK: "Courtois",
        ST: null,
      });

      expect(invokeMock).toHaveBeenCalledWith({
        filledPositions: "GK: Courtois",
        emptyPositions: "ST",
      });
      expect(result).toEqual(chainResponse);
    });

    it("Debería convertir los errores de la cadena en AI_SERVICE_ERROR", async () => {
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => undefined);

      invokeMock.mockRejectedValue(new Error("timeout"));

      await expect(
        aiTacticService.getRecommendations({ ST: null }),
      ).rejects.toThrow("AI_SERVICE_ERROR");

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });
});
