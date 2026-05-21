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

    @Override
    public PlayerDetailResponseDTO getPlayerProfileWithReviews(Long playerId) {
        // 1. Buscamos el jugador en nuestra BD local relacional
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new RuntimeException("Jugador no encontrado"));

        // 2. Traemos las reseñas consumiendo el microservicio externo vía OpenFeign
        // Nota: Si reviewMS está caído, el fallback integrado devolverá una lista vacía
        // de forma segura
        List<ReviewDTO> reviews = reviewFeignClient.getReviewsByPlayerId(playerId);

        // 3. Empaquetamos todo en el DTO para el frontend (Angular/Ionic)
        return new PlayerDetailResponseDTO(player, reviews);
    }

    @Override
    public Player updatePlayerPartial(Long id, Player playerDetails) {
        Player existingPlayer = playerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Jugador no encontrado"));

        // Simulación de PATCH (Modificación parcial): Solo sobreescribimos campos que
        // no vengan nulos
        if (playerDetails.getTeam() != null)
            existingPlayer.setTeam(playerDetails.getTeam());
        if (playerDetails.getLeague() != null)
            existingPlayer.setLeague(playerDetails.getLeague());
        if (playerDetails.getNumber() != null)
            existingPlayer.setNumber(playerDetails.getNumber());
        if (playerDetails.getLatitude() != null)
            existingPlayer.setLatitude(playerDetails.getLatitude());
        if (playerDetails.getLongitude() != null)
            existingPlayer.setLongitude(playerDetails.getLongitude());

        // Mapeos adicionales por si se modifican campos base desde el formulario
        // interno
        if (playerDetails.getName() != null)
            existingPlayer.setName(playerDetails.getName());
        if (playerDetails.getPosition() != null)
            existingPlayer.setPosition(playerDetails.getPosition());
        if (playerDetails.getPhotoUrl() != null)
            existingPlayer.setPhotoUrl(playerDetails.getPhotoUrl());

        // Guardamos los cambios consolidados en la base de datos
        return playerRepository.save(existingPlayer);
    }
}