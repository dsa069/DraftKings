package draftkings.eureka.client.player.service;

import draftkings.eureka.client.player.domain.Player;
import draftkings.eureka.client.player.dto.PlayerDetailResponseDTO;
import draftkings.eureka.client.player.dto.ReviewDTO;
import draftkings.eureka.client.player.repository.PlayerRepository;
import draftkings.eureka.client.player.client.ReviewClient;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PlayerServiceImpl implements PlayerService {

    private final PlayerRepository playerRepository;
    private final ReviewClient reviewFeignClient;

    public PlayerServiceImpl(PlayerRepository playerRepository, ReviewClient reviewFeignClient) {
        this.playerRepository = playerRepository;
        this.reviewFeignClient = reviewFeignClient;
    }

    public PlayerDetailResponseDTO getPlayerProfileWithReviews(Long playerId) {
        // 1. Buscamos el jugador en nuestra Base de Datos local
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new RuntimeException("Jugador no encontrado"));

        // 2. Buscamos los comentarios llamando al microservicio de Reviews mediante
        // Feign
        // Si el servicio externo está caído, el Fallback devolverá de inmediato una
        // lista vacía.
        List<ReviewDTO> reviews = reviewFeignClient.getReviewsByPlayerId(playerId);

        // 3. Empaquetamos y retornamos el DTO compuesto
        return new PlayerDetailResponseDTO(player, reviews);
    }
}
