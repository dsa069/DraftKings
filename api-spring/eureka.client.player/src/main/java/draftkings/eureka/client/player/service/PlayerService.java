package draftkings.eureka.client.player.service;

import draftkings.eureka.client.player.domain.Player;
import draftkings.eureka.client.player.dto.PlayerDetailResponseDTO;

public interface PlayerService {

    // 4) Detalle completo (Lógica de orquestación distribuida con Feign)
    PlayerDetailResponseDTO getPlayerProfileWithReviews(Long playerId);

    // 7) Modificación parcial (Lógica condicional de campos)
    Player updatePlayerPartial(Long id, Player playerDetails);
}