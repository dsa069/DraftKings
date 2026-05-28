package draftkings.eureka.client.player.service;

import draftkings.eureka.client.player.dto.TacticRecommendationResponseDTO;
import java.util.Map;

public interface AiTacticService {
    TacticRecommendationResponseDTO getRecommendations(Map<String, String> positions);
}