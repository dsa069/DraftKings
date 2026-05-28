package draftkings.eureka.client.player.controller;

import draftkings.eureka.client.player.dto.TacticRecommendationRequestDTO;
import draftkings.eureka.client.player.dto.TacticRecommendationResponseDTO;
import draftkings.eureka.client.player.exception.BadRequestException;
import draftkings.eureka.client.player.exception.CustomResponse;
import draftkings.eureka.client.player.service.AiTacticService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tactics")
@Tag(name = "Tactics AI", description = "Operaciones relacionadas con tácticas e Inteligencia Artificial")
public class TacticController {

    private final AiTacticService aiTacticService;

    public TacticController(AiTacticService aiTacticService) {
        this.aiTacticService = aiTacticService;
    }

    @PostMapping("/recommendations")
    @Operation(summary = "Obtener recomendaciones de IA para alineación", description = "Procesa las posiciones actuales mediante una IA para sugerir jugadores")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Recomendaciones generadas con éxito", content = @Content(schema = @Schema(implementation = TacticRecommendationResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "El mapa de posiciones es inválido o está vacío", content = @Content(schema = @Schema(implementation = CustomResponse.class))),
            @ApiResponse(responseCode = "503", description = "Error de comunicación o timeout con el proveedor del servicio de IA", content = @Content(schema = @Schema(implementation = CustomResponse.class))),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor", content = @Content(schema = @Schema(implementation = CustomResponse.class))) })
    public ResponseEntity<?> getAiRecommendations(@RequestBody TacticRecommendationRequestDTO request) {
        // Validación: Bad Request si el cuerpo o el mapa están vacíos
        if (request == null || request.positions() == null || request.positions().isEmpty()) {
            throw new BadRequestException("El formato del mapa de posiciones es inválido o no se han enviado datos.");
        }

        TacticRecommendationResponseDTO response = aiTacticService.getRecommendations(request.positions());
        return ResponseEntity.ok(response);
    }
}