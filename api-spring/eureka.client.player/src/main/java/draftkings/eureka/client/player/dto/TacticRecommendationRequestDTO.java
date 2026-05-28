package draftkings.eureka.client.player.dto;

import java.util.Map;

public record TacticRecommendationRequestDTO(
                Map<String, String> positions) {
}