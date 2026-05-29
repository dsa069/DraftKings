package draftkings.eureka.client.player.controller;

import draftkings.eureka.client.player.domain.Player;
import draftkings.eureka.client.player.dto.PlayerDetailResponseDTO;
import draftkings.eureka.client.player.dto.PlayerExternalDTO;
import draftkings.eureka.client.player.exception.BadRequestException;
import draftkings.eureka.client.player.exception.CustomResponse;
import draftkings.eureka.client.player.exception.ResourceNotFoundException;
import draftkings.eureka.client.player.exception.ServiceUnavailableException;
import draftkings.eureka.client.player.repository.PlayerRepository;
import draftkings.eureka.client.player.service.PlayerService;
import draftkings.eureka.client.player.service.ApiFootballService;
import draftkings.eureka.client.player.dto.ReviewDTO;
import draftkings.eureka.client.player.client.ReviewClient;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

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
@Tag(name = "Players", description = "CRUD de jugadores y operaciones externas")
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
    @Operation(summary = "Obtener listado de jugadores", description = "Lista paginada de jugadores con filtros opcionales")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de jugadores obtenida", content = @Content(array = @ArraySchema(schema = @Schema(implementation = Player.class)))),
            @ApiResponse(responseCode = "400", description = "Parámetros inválidos", content = @Content(schema = @Schema(implementation = CustomResponse.class))),
            @ApiResponse(responseCode = "500", description = "Error interno inesperado", content = @Content(schema = @Schema(implementation = CustomResponse.class), examples = @ExampleObject(value = "{\"timestamp\":\"2026-04-10T12:00:00Z\",\"status\":500,\"error\":\"Unexpected error while loading players\",\"path\":\"/api/players\"}"))) })
    public ResponseEntity<Page<Player>> getAllPlayers(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "team", required = false) String team,
            @RequestParam(value = "league", required = false) String league,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {

        if (page < 0 || size <= 0) {
            throw new BadRequestException("Page must be zero or greater and size must be greater than zero");
        }

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
    @Operation(summary = "Obtener detalle de un jugador", description = "Devuelve el jugador con sus reseñas asociadas.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Detalle del jugador", content = @Content(schema = @Schema(implementation = PlayerDetailResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Identificador de jugador inválido", content = @Content(schema = @Schema(implementation = CustomResponse.class), examples = @ExampleObject(value = "{\"timestamp\":\"2026-04-10T12:00:00Z\",\"status\":400,\"error\":\"Player id must be greater than zero\",\"path\":\"/api/players/1\"}"))),
            @ApiResponse(responseCode = "404", description = "Jugador no encontrado", content = @Content(schema = @Schema(implementation = CustomResponse.class), examples = @ExampleObject(value = "{\"timestamp\":\"2026-04-10T12:00:00Z\",\"status\":404,\"error\":\"Player not found: 1\",\"path\":\"/api/players/1\"}"))),
            @ApiResponse(responseCode = "500", description = "Error interno inesperado", content = @Content(schema = @Schema(implementation = CustomResponse.class), examples = @ExampleObject(value = "{\"timestamp\":\"2026-04-10T12:00:00Z\",\"status\":500,\"error\":\"Unexpected error while loading player details\",\"path\":\"/api/players/1\"}"))) })
    public ResponseEntity<PlayerDetailResponseDTO> getPlayerById(@PathVariable Long id) {
        if (id == null || id <= 0) {
            throw new BadRequestException("Player id must be greater than zero");
        }
        PlayerDetailResponseDTO playerDetail = playerService.getPlayerProfileWithReviews(id);
        return ResponseEntity.ok(playerDetail);
    }

    // 5) Crear un jugador -> DIRECTO A REPOSITORY
    @PostMapping
    @Operation(summary = "Crear un jugador", description = "Registrar un nuevo jugador manualmente")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Jugador creado con éxito", content = @Content(schema = @Schema(implementation = Player.class))),
            @ApiResponse(responseCode = "400", description = "Body inválido", content = @Content(schema = @Schema(implementation = CustomResponse.class), examples = @ExampleObject(value = "{\"timestamp\":\"2026-04-10T12:00:00Z\",\"status\":400,\"error\":\"Invalid player payload\",\"path\":\"/api/players\"}"))),
            @ApiResponse(responseCode = "500", description = "Error interno inesperado", content = @Content(schema = @Schema(implementation = CustomResponse.class), examples = @ExampleObject(value = "{\"timestamp\":\"2026-04-10T12:00:00Z\",\"status\":500,\"error\":\"Error creating player\",\"path\":\"/api/players\"}"))) })
    public ResponseEntity<Player> createPlayer(@RequestBody Player player) {
        if (player == null) {
            throw new BadRequestException("Invalid player payload");
        }
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
    @Operation(summary = "Editar datos de un jugador", description = "Actualiza parcialmente un jugador existente")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Jugador actualizado", content = @Content(schema = @Schema(implementation = Player.class))),
            @ApiResponse(responseCode = "404", description = "Jugador no encontrado", content = @Content(schema = @Schema(implementation = CustomResponse.class), examples = @ExampleObject(value = "{\"timestamp\":\"2026-04-10T12:00:00Z\",\"status\":404,\"error\":\"Player not found: 1\",\"path\":\"/api/players/1\"}"))),
            @ApiResponse(responseCode = "500", description = "Error interno inesperado", content = @Content(schema = @Schema(implementation = CustomResponse.class), examples = @ExampleObject(value = "{\"timestamp\":\"2026-04-10T12:00:00Z\",\"status\":500,\"error\":\"Error updating player\",\"path\":\"/api/players/1\"}"))) })
    public ResponseEntity<Player> updatePlayer(@PathVariable Long id, @RequestBody Player playerDetails) {
        Player updatedPlayer = playerService.updatePlayerPartial(id, playerDetails);
        return ResponseEntity.ok(updatedPlayer);
    }

    // 8) Eliminar un jugador -> DIRECTO A REPOSITORY
    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar un jugador", description = "Borra un jugador permanentemente")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Eliminación exitosa"),
            @ApiResponse(responseCode = "404", description = "Jugador no encontrado", content = @Content(schema = @Schema(implementation = CustomResponse.class), examples = @ExampleObject(value = "{\"timestamp\":\"2026-04-10T12:00:00Z\",\"status\":404,\"error\":\"Player not found: 1\",\"path\":\"/api/players/1\"}"))),
            @ApiResponse(responseCode = "500", description = "Error interno inesperado", content = @Content(schema = @Schema(implementation = CustomResponse.class), examples = @ExampleObject(value = "{\"timestamp\":\"2026-04-10T12:00:00Z\",\"status\":500,\"error\":\"Error deleting player\",\"path\":\"/api/players/1\"}"))) })
    public ResponseEntity<Void> deletePlayer(@PathVariable Long id) {
        if (playerRepository.existsById(id)) {
            playerRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        throw new ResourceNotFoundException(HttpStatus.NOT_FOUND, "Jugador no encontrado");
    }

    // 6) Obtener jugadores desde la API externa -> USA EL SERVICE (Por la lógica de
    // orquestación y transformación)
    @GetMapping("/external")
    @Operation(summary = "Obtener jugadores desde la API externa", description = "Consulta API-Football y devuelve una lista normalizada")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de jugadores externos obtenida", content = @Content(array = @ArraySchema(schema = @Schema(implementation = PlayerExternalDTO.class)))),
            @ApiResponse(responseCode = "503", description = "Servicio externo no disponible o circuit breaker abierto", content = @Content(schema = @Schema(implementation = CustomResponse.class), examples = @ExampleObject(value = "{\"timestamp\":\"2026-04-10T12:00:00Z\",\"status\":503,\"error\":\"Failed to fetch players from external API\",\"path\":\"/api/players/external\"}"))),
            @ApiResponse(responseCode = "500", description = "Error consultando la API externa", content = @Content(schema = @Schema(implementation = CustomResponse.class), examples = @ExampleObject(value = "{\"timestamp\":\"2026-04-10T12:00:00Z\",\"status\":500,\"error\":\"Failed to fetch players from external API\",\"path\":\"/api/players/external\"}"))) })
    public ResponseEntity<List<PlayerExternalDTO>> getExternalPlayers(
            @RequestParam(value = "search", required = false) String search) {
        List<PlayerExternalDTO> players = apiFootballService.searchExternalPlayers(search);
        return ResponseEntity.ok(players);
    }

    // 7) Importar jugadores desde la API externa -> DIRECTO A REPOSITORY (El
    // servicio ya hace la orquestación y transformación)
    @PostMapping("/import")
    @Operation(summary = "Importar jugadores desde la API externa", description = "Recibe una lista de jugadores y los persiste en la BD")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Jugadores importados correctamente"),
            @ApiResponse(responseCode = "400", description = "El body es inválido o está vacío", content = @Content(schema = @Schema(implementation = CustomResponse.class), examples = @ExampleObject(value = "{\"timestamp\":\"2026-04-10T12:00:00Z\",\"status\":400,\"error\":\"El body no contiene jugadores para importar\",\"path\":\"/api/players/import\"}"))),
            @ApiResponse(responseCode = "500", description = "Error al insertar en base de datos", content = @Content(schema = @Schema(implementation = CustomResponse.class), examples = @ExampleObject(value = "{\"timestamp\":\"2026-04-10T12:00:00Z\",\"status\":500,\"error\":\"Error importing players\",\"path\":\"/api/players/import\"}"))) })
    public ResponseEntity<Void> importPlayers(@RequestBody List<Player> playersToImport) {
        if (playersToImport == null || playersToImport.isEmpty()) {
            throw new BadRequestException("El body no contiene jugadores para importar");
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
    @Operation(summary = "Obtener comentarios de un jugador", description = "Devuelve todas las reseñas de un jugador. Si reviewMS está caído, el fallback devuelve una lista vacía y no se expone 503.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Comentarios obtenidos", content = @Content(array = @ArraySchema(schema = @Schema(implementation = ReviewDTO.class)))),
            @ApiResponse(responseCode = "400", description = "Identificador de jugador inválido", content = @Content(schema = @Schema(implementation = CustomResponse.class), examples = @ExampleObject(value = "{\"timestamp\":\"2026-04-10T12:00:00Z\",\"status\":400,\"error\":\"Player id must be greater than zero\",\"path\":\"/api/players/1/reviews\"}"))),
            @ApiResponse(responseCode = "404", description = "Jugador no encontrado", content = @Content(schema = @Schema(implementation = CustomResponse.class), examples = @ExampleObject(value = "{\"timestamp\":\"2026-04-10T12:00:00Z\",\"status\":404,\"error\":\"Player not found: 1\",\"path\":\"/api/players/1/reviews\"}"))),
            @ApiResponse(responseCode = "500", description = "Error interno inesperado", content = @Content(schema = @Schema(implementation = CustomResponse.class), examples = @ExampleObject(value = "{\"timestamp\":\"2026-04-10T12:00:00Z\",\"status\":500,\"error\":\"Error loading reviews\",\"path\":\"/api/players/1/reviews\"}"))) })
    public ResponseEntity<List<ReviewDTO>> getPlayerReviews(@PathVariable("id") Long playerId) {
        if (playerId == null || playerId <= 0) {
            throw new BadRequestException("Player id must be greater than zero");
        }

        if (!playerRepository.existsById(playerId)) {
            throw new ResourceNotFoundException(HttpStatus.NOT_FOUND, "Player not found: " + playerId);
        }

        // En un caso de uso estricto de DDD/Clean, esto pasaría por el Service.
        // Para simplificar según tu patrón actual directo a cliente/repo:
        List<ReviewDTO> reviews = reviewClient.getReviewsByPlayerId(playerId);
        return ResponseEntity.ok(reviews);
    }

    // 11) Crear un comentario para un jugador
    @PostMapping("/{id}/reviews")
    @Operation(summary = "Crear un comentario para un jugador", description = "Añade una reseña a un jugador")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Comentario añadido con éxito", content = @Content(schema = @Schema(implementation = ReviewDTO.class))),
            @ApiResponse(responseCode = "400", description = "El body de la reseña es inválido o incompleto", content = @Content(schema = @Schema(implementation = CustomResponse.class), examples = @ExampleObject(value = "{\"timestamp\":\"2026-04-10T12:00:00Z\",\"status\":400,\"error\":\"Review text and rating are required\",\"path\":\"/api/players/1/reviews\"}"))),
            @ApiResponse(responseCode = "503", description = "Servicio de reseñas no disponible", content = @Content(schema = @Schema(implementation = CustomResponse.class), examples = @ExampleObject(value = "{\"timestamp\":\"2026-04-10T12:00:00Z\",\"status\":503,\"error\":\"Servicio de reseñas no disponible\",\"path\":\"/api/players/1/reviews\"}"))),
            @ApiResponse(responseCode = "500", description = "Error interno inesperado", content = @Content(schema = @Schema(implementation = CustomResponse.class), examples = @ExampleObject(value = "{\"timestamp\":\"2026-04-10T12:00:00Z\",\"status\":500,\"error\":\"Error creating review\",\"path\":\"/api/players/1/reviews\"}"))) })
    public ResponseEntity<ReviewDTO> createPlayerReview(@PathVariable("id") Long playerId,
            @RequestBody ReviewDTO review) {
        if (review == null || review.getText() == null || review.getText().isBlank() || review.getRating() == null) {
            throw new BadRequestException("Review text and rating are required");
        }

        ReviewDTO createdReview = reviewClient.createReview(playerId, review);

        // Si el circuit breaker actúa, devuelve null. Protegemos la respuesta.
        if (createdReview == null) {
            throw new ServiceUnavailableException("Servicio de reseñas no disponible");
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(createdReview);
    }
}