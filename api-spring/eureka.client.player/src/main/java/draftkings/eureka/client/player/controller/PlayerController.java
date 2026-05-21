package draftkings.eureka.client.player.controller;

import draftkings.eureka.client.player.domain.Player;
import draftkings.eureka.client.player.dto.PlayerDetailResponseDTO;
import draftkings.eureka.client.player.repository.PlayerRepository;
import draftkings.eureka.client.player.service.PlayerService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;
import java.util.Date;

@RestController
@RequestMapping("/api/players")
public class PlayerController {

    private final PlayerRepository playerRepository;
    private final PlayerService playerService; // Solo lo inyectamos para los métodos con lógica

    public PlayerController(PlayerRepository playerRepository, PlayerService playerService) {
        this.playerRepository = playerRepository;
        this.playerService = playerService;
    }

    // 3) Obtener listado de jugadores -> DIRECTO A REPOSITORY
    @GetMapping
    public ResponseEntity<Page<Player>> getAllPlayers(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "team", required = false) String team,
            @RequestParam(value = "league", required = false) String league,
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {

        Date dateParam = null;
        if (startDate != null && !startDate.isEmpty()) {
            try {
                dateParam = Date.from(ZonedDateTime.parse(startDate).toInstant());
            } catch (Exception e) {
                // Si el parseo falla ignoramos el filtro de fecha de alta
            }
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<Player> players = playerRepository.findAllWithFilters(search, team, league, dateParam, pageable);
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
}