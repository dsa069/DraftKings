package draftkings.eureka.client.player.service;

import draftkings.eureka.client.player.domain.Player;
import draftkings.eureka.client.player.dto.PlayerDetailResponseDTO;
import draftkings.eureka.client.player.dto.ReviewDTO;
import draftkings.eureka.client.player.exception.ResourceNotFoundException;
import draftkings.eureka.client.player.repository.PlayerRepository;
import draftkings.eureka.client.player.client.ReviewClient;

import org.springframework.http.HttpStatus;
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
                .orElseThrow(() -> new ResourceNotFoundException(HttpStatus.NOT_FOUND, "Jugador no encontrado"));

        // 2. Traemos las reseñas consumiendo el microservicio externo vía OpenFeign
        // protegiendo la llamada
        List<ReviewDTO> reviews;
        try {
            reviews = reviewFeignClient.getReviewsByPlayerId(playerId);
            if (reviews == null) {
                reviews = List.of(); // Si viene nulo, inicializamos lista vacía
            }
        } catch (Exception e) {
            // Si reviewMS devuelve 404 porque no hay reseñas, o si está caído,
            // capturamos el error para que NO rompa la petición del jugador
            System.out.println("No se pudieron cargar las reseñas del jugador " + playerId + ": " + e.getMessage());
            reviews = List.of();
        }

        // 3. Empaquetamos todo en el DTO para el frontend de forma segura
        return new PlayerDetailResponseDTO(player, reviews);
    }

    @Override
    public Player updatePlayerPartial(Long id, Player playerDetails) {
        Player existingPlayer = playerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(HttpStatus.NOT_FOUND, "Jugador no encontrado"));

        // Campos originales que ya tenías
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
        if (playerDetails.getName() != null)
            existingPlayer.setName(playerDetails.getName());
        if (playerDetails.getPosition() != null)
            existingPlayer.setPosition(playerDetails.getPosition());
        if (playerDetails.getPhotoUrl() != null)
            existingPlayer.setPhotoUrl(playerDetails.getPhotoUrl());

        // NUEVOS CAMPOS AÑADIDOS
        if (playerDetails.getFirstName() != null)
            existingPlayer.setFirstName(playerDetails.getFirstName());
        if (playerDetails.getLastName() != null)
            existingPlayer.setLastName(playerDetails.getLastName());
        if (playerDetails.getAge() != null)
            existingPlayer.setAge(playerDetails.getAge());
        if (playerDetails.getBirthdate() != null)
            existingPlayer.setBirthdate(playerDetails.getBirthdate());
        if (playerDetails.getNationality() != null)
            existingPlayer.setNationality(playerDetails.getNationality());
        if (playerDetails.getHeight() != null)
            existingPlayer.setHeight(playerDetails.getHeight());
        if (playerDetails.getWeight() != null)
            existingPlayer.setWeight(playerDetails.getWeight());

        // Guardamos los cambios consolidados en la base de datos
        return playerRepository.save(existingPlayer);
    }
}