package draftkings.eureka.client.player.controller;

import draftkings.eureka.client.player.domain.Player;
import draftkings.eureka.client.player.dto.PlayerDetailResponseDTO;
import draftkings.eureka.client.player.dto.PlayerExternalDTO;
import draftkings.eureka.client.player.repository.PlayerRepository;
import draftkings.eureka.client.player.service.PlayerService;
import draftkings.eureka.client.player.service.ApiFootballService;
import draftkings.eureka.client.player.dto.ReviewDTO;
import draftkings.eureka.client.player.client.ReviewClient;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/players")
public class PlayerController {

    private final PlayerRepository playerRepository;
    private final PlayerService playerService; // Solo lo inyectamos para los métodos con lógica
    private final ApiFootballService apiFootballService;
    private final ReviewClient reviewClient;

    public PlayerController(PlayerRepository playerRepository, PlayerService playerService,
            ApiFootballService apiFootballService, ReviewClient reviewClient) {
        this.playerRepository = playerRepository;
        this.playerService = playerService;
        this.apiFootballService = apiFootballService;
        this.reviewClient = reviewClient;
    }

    // 3) Obtener listado de jugadores -> DIRECTO A REPOSITORY
    @GetMapping
    public ResponseEntity<Page<Player>> getAllPlayers(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "team", required = false) String team,
            @RequestParam(value = "league", required = false) String league,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {

        Date startDateAsDate = null;
        if (startDate != null) {
            startDateAsDate = java.sql.Date.valueOf(startDate);
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<Player> players = playerRepository.findAllWithFilters(search, team, league, startDateAsDate, pageable);
        return ResponseEntity.ok(players);
    }

    // 4) Obtener detalle de un jugador -> USA EL SERVICE (Por la orquestación
    // distribuida)
    @GetMapping("/{id}")
    public ResponseEntity<PlayerDetailResponseDTO> getPlayerById(@PathVariable Long id) {
        try {
            PlayerDetailResponseDTO playerDetail = playerService.getPlayerProfileWithReviews(id);
            return ResponseEntity.ok(playerDetail);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // 5) Crear un jugador -> DIRECTO A REPOSITORY
    @PostMapping
    public ResponseEntity<Player> createPlayer(@RequestBody Player player) {
        if (player.getCreatedAt() == null) {
            player.setCreatedAt(new Date());
        }
        Player savedPlayer = playerRepository.save(player);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedPlayer);
    }

    // 7) Editar datos de un jugador -> USA EL SERVICE (Por la lógica de mezcla
    // condicional)
    // Nota: En un escenario real, este endpoint podría ser un PATCH, pero para
    // simplificar lo dejamos como PUT con lógica de modificación parcial dentro del
    // servicio
    @PutMapping("/{id}")
    public ResponseEntity<Player> updatePlayer(@PathVariable Long id, @RequestBody Player playerDetails) {
        try {
            Player updatedPlayer = playerService.updatePlayerPartial(id, playerDetails);
            return ResponseEntity.ok(updatedPlayer);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // 8) Eliminar un jugador -> DIRECTO A REPOSITORY
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlayer(@PathVariable Long id) {
        if (playerRepository.existsById(id)) {
            playerRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/external")
    public ResponseEntity<List<PlayerExternalDTO>> getExternalPlayers(
            @RequestParam(value = "search", required = false) String search) {
        List<PlayerExternalDTO> players = apiFootballService.searchExternalPlayers(search);
        return ResponseEntity.ok(players);
    }

    @PostMapping("/import")
    public ResponseEntity<Void> importPlayers(@RequestBody List<Player> playersToImport) {
        if (playersToImport == null || playersToImport.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        // Aseguramos que la fecha de creación se asigne si es necesario
        for (Player p : playersToImport) {
            if (p.getCreatedAt() == null) {
                p.setCreatedAt(new Date());
            }
        }

        // El repositorio guarda toda la lista en una sola transacción eficiente
        playerRepository.saveAll(playersToImport);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    // 10) Obtener comentarios de un jugador
    @GetMapping("/{id}/reviews")
    public ResponseEntity<List<ReviewDTO>> getPlayerReviews(@PathVariable("id") Long playerId) {
        // En un caso de uso estricto de DDD/Clean, esto pasaría por el Service.
        // Para simplificar según tu patrón actual directo a cliente/repo:
        List<ReviewDTO> reviews = reviewClient.getReviewsByPlayerId(playerId);
        return ResponseEntity.ok(reviews);
    }

    // 11) Crear un comentario para un jugador
    @PostMapping("/{id}/reviews")
    public ResponseEntity<ReviewDTO> createPlayerReview(@PathVariable("id") Long playerId,
            @RequestBody ReviewDTO review) {
        ReviewDTO createdReview = reviewClient.createReview(playerId, review);

        // Si el circuit breaker actúa, devuelve null. Protegemos la respuesta.
        if (createdReview == null) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(createdReview);
    }
}