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
    this.chain = RunnableSequence.from([
      new PromptTemplate({
        template: `Eres un entrenador de fútbol de élite mundial y analista táctico experto.
        Dada una lista de posiciones ocupadas por jugadores y una lista de posiciones vacías en el campo, sugiere jugadores reales de primer nivel EXCLUSIVAMENTE para llenar las posiciones vacías para equilibrar el esquema.
        
        REGLA OBLIGATORIA PARA EL CAMPO "message":
        Debes incluir siempre una explicación explícita de en qué te has basado del equipo actual para tomar tu decisión. El mensaje debe comenzar o fundamentarse fuertemente bajo la estructura "Basado en...", analizando los jugadores actuales, sus sinergias, deficiencias o estilo de juego (por ejemplo: "Basado en la velocidad de Salah y el control de Pedri...").
        
        {format_instructions}
        
        Posiciones ocupadas actualmente: {filledPositions}
        Posiciones que debes rellenar obligatoriamente: {emptyPositions}`,
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
