import { z } from "zod";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { ChatGroq } from "@langchain/groq";

export class AiTacticService {
  private parser: StructuredOutputParser<typeof this.schema>;
  private chain: RunnableSequence<Record<string, unknown>, any>;

  // Definimos el esquema estático para TypeScript y Zod
  private schema = z.object({
    message: z
      .string()
      .describe(
        "Mensaje descriptivo y justificación táctica de máximo 3 líneas",
      ),
    recommendations: z
      .record(z.string(), z.string())
      .describe(
        "Objeto cuyas claves son las posiciones vacías y los valores el nombre del jugador recomendado",
      ),
  });

  constructor() {
    // 1. Inicializar el modelo de Groq (Requiere GROQ_API_KEY en tu .env)
    // Llama 3 (70b o 8b) o Mixtral son excelentes y rapidísimos en Groq
    const model = new ChatGroq({
      model: "openai/gpt-oss-120b",
      temperature: 0.7,
    });

    // 2. Crear el parser desde el esquema Zod (igual que en tu ejemplo js)
    this.parser = StructuredOutputParser.fromZodSchema(this.schema);

    // 3. Crear la secuencia con LangChain
    // 3. Crear la secuencia con LangChain
    this.chain = RunnableSequence.from([
      new PromptTemplate({
        template: `You are a world-class football manager and expert tactical analyst.
        Given a list of positions occupied by players and a list of empty positions on the pitch, suggest top-tier real-world players EXCLUSIVELY to fill the empty positions to balance the tactical system.
        
        CRITICAL TACTICAL REQUIREMENT:
        You must carefully analyze the exact positions where the current players are deployed. Pay close attention to whether they are in their natural roles or in unusual/unconventional positions (e.g., Cristiano Ronaldo being placed as a defender). Your recommendations and justification must account for this specific layout to either compensate for the anomaly or complement the overall structure.
        
        MANDATORY RULE FOR THE "message" FIELD:
        The entire response must be in English. You must include an explicit explanation of what you based your decision on regarding the current team layout. The message MUST start with or be heavily grounded in the structure "Based on...", analyzing the current players, their specific positions, synergies, deficiencies, or playstyle (for example: "Based on having Cristiano Ronaldo in defense and the speed of Salah...").
        
        {format_instructions}
        
        Currently occupied positions: {filledPositions}
        Positions you must fill: {emptyPositions}`,
        inputVariables: ["filledPositions", "emptyPositions"],
        partialVariables: {
          format_instructions: this.parser.getFormatInstructions(),
        },
      }),
      model,
      this.parser,
    ]);
  }

  async getRecommendations(positions: Record<string, string | null>) {
    // Filtrar para dar contexto a LangChain
    const emptyPositions = Object.keys(positions).filter(
      (pos) => positions[pos] === null,
    );
    const filledPositions = Object.entries(positions)
      .filter(([, player]) => player !== null)
      .map(([pos, player]) => `${pos}: ${player}`)
      .join(", ");

    if (emptyPositions.length === 0) {
      throw new Error("NO_EMPTY_POSITIONS");
    }

    try {
      // 4. Invocar la cadena de LangChain (Prompt -> Groq -> Parser Zod)
      const response = await this.chain.invoke({
        filledPositions: filledPositions || "Ninguna",
        emptyPositions: emptyPositions.join(", "),
      });

      return response; // Ya viene parseado como el objeto JSON exacto
    } catch (error) {
      console.error("Error en LangChain/Groq:", error);
      throw new Error("AI_SERVICE_ERROR", { cause: error });
    }
  }
}
