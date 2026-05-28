package draftkings.eureka.client.player.controller;

import draftkings.eureka.client.player.dto.TacticRecommendationRequestDTO;
import draftkings.eureka.client.player.dto.TacticRecommendationResponseDTO;
import draftkings.eureka.client.player.service.AiTacticService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/tactics")
public class TacticController {

    private final AiTacticService aiTacticService;

    public TacticController(AiTacticService aiTacticService) {
        this.aiTacticService = aiTacticService;
    }

    @PostMapping("/recommendations")
    public ResponseEntity<?> getAiRecommendations(@RequestBody TacticRecommendationRequestDTO request) {
        // Validación: Bad Request si el cuerpo o el mapa están vacíos
        if (request == null || request.positions() == null || request.positions().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message",
                            "El formato del mapa de posiciones es inválido o no se han enviado datos."));
        }

        try {
            TacticRecommendationResponseDTO response = aiTacticService.getRecommendations(request.positions());
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "No hay posiciones vacías para cubrir en esta alineación."));

        } catch (IllegalStateException e) {
            // Captura el error de timeout/comunicación con Groq (503)
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("message",
                            "Error de comunicación o timeout con el proveedor del servicio de Inteligencia Artificial."));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Unknown Error"));
        }
    }
}