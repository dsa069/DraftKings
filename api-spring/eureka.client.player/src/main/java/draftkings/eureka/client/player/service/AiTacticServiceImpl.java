package draftkings.eureka.client.player.service;

import draftkings.eureka.client.player.dto.TacticRecommendationResponseDTO;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.ai.converter.BeanOutputConverter;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AiTacticServiceImpl implements AiTacticService {

    private final ChatModel chatModel;
    // El convertidor le indicará internamente a la IA qué JSON exacto construir
    private final BeanOutputConverter<TacticRecommendationResponseDTO> outputConverter;

    public AiTacticServiceImpl(ChatModel chatModel) {
        this.chatModel = chatModel;
        this.outputConverter = new BeanOutputConverter<>(TacticRecommendationResponseDTO.class);
    }

    @Override
    public TacticRecommendationResponseDTO getRecommendations(Map<String, String> positions) {
        // 1. Filtrar posiciones vacías y ocupadas
        List<String> emptyPositions = positions.entrySet().stream()
                .filter(entry -> entry.getValue() == null)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());

        String filledPositions = positions.entrySet().stream()
                .filter(entry -> entry.getValue() != null)
                .map(entry -> entry.getKey() + ": " + entry.getValue())
                .collect(Collectors.joining(", "));

        if (emptyPositions.isEmpty()) {
            throw new IllegalArgumentException("NO_EMPTY_POSITIONS");
        }

        // 2. Definir el prompt en inglés con los requerimientos tácticos estrictos
        String template = """
                You are a world-class football manager and expert tactical analyst.
                Given a list of positions occupied by players and a list of empty positions on the pitch, suggest top-tier real-world players EXCLUSIVELY to fill the empty positions to balance the tactical system.

                CRITICAL TACTICAL REQUIREMENT:
                You must carefully analyze the exact positions where the current players are deployed. Pay close attention to whether they are in their natural roles or in unusual/unconventional positions (e.g., Cristiano Ronaldo being placed as a defender). Your recommendations and justification must account for this specific layout to either compensate for the anomaly or complement the overall structure.

                MANDATORY RULE FOR THE "message" FIELD:
                The entire response must be in English. You must include an explicit explanation of what you based your decision on regarding the current team layout. The message MUST start with or be heavily grounded in the structure "Based on...", analyzing the current players, their specific positions, synergies, deficiencies, or playstyle (for example: "Based on having Cristiano Ronaldo in defense and the speed of Salah...").

                {format_instructions}

                Currently occupied positions: {filledPositions}
                Positions you must fill: {emptyPositions}
                """;

        // 3. Compilar el prompt inyectando variables e instrucciones de formato
        // estructural
        PromptTemplate promptTemplate = new PromptTemplate(template);
        promptTemplate.add("filledPositions", filledPositions.isEmpty() ? "None" : filledPositions);
        promptTemplate.add("emptyPositions", String.join(", ", emptyPositions));
        promptTemplate.add("format_instructions", outputConverter.getFormat());

        try {
            Prompt prompt = promptTemplate.create();
            ChatResponse chatResponse = chatModel.call(prompt);

            // EXTRAER EL TEXTO CRUDO ANTES DE PARSEARLO
            String rawOutput = chatResponse.getResult().getOutput().getText();

            // IMPRIMIR EN CONSOLA PARA DEPURAR
            System.out.println("====== RESPUESTA CRUDA DE GROQ ======");
            System.out.println(rawOutput);
            System.out.println("=====================================");

            // Mapear y parsear automáticamente el JSON string
            return outputConverter.convert(rawOutput);

        } catch (Exception e) {
            // IMPRIMIR EL ERROR REAL EN CONSOLA
            System.err.println("====== ERROR DE COMUNICACIÓN O PARSEO DE IA ======");
            e.printStackTrace();
            throw new IllegalStateException("AI_SERVICE_ERROR", e);
        }
    }
}