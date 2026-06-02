package draftkings.eureka.client.player.dto;

import java.util.Map;

public record TacticRecommendationResponseDTO(
                String message,
                Map<String, String> recommendations) {
}