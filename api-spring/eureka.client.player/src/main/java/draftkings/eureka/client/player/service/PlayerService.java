package draftkings.eureka.client.player.service;

import draftkings.eureka.client.player.dto.PlayerDetailResponseDTO;

public interface PlayerService {

    public PlayerDetailResponseDTO getPlayerProfileWithReviews(Long playerId);
}
