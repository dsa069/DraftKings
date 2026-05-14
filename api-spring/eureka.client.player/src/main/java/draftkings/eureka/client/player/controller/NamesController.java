package draftkings.eureka.client.player.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import draftkings.eureka.client.player.service.NamesService;

@RestController
public class NamesController {

    @Autowired
    NamesService namesService;

    /**
     * POST /names
     * Obtiene y valida el nombre del jugador y la reseña.
     * Body: {"playerName": "Juan", "reviewName": "Review1"}
     */
    @PostMapping("/names")
    public ResponseEntity<String> insertName(@RequestBody String requestBody) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode jsonNode = mapper.readTree(requestBody);

            String playerName = jsonNode.has("playerName") ? jsonNode.get("playerName").asText() : null;
            String reviewName = jsonNode.has("reviewName") ? jsonNode.get("reviewName").asText() : null;

            // Delegar lógica de negocio al servicio
            String playerResult = playerName != null ? namesService.getPlayerName(playerName) : null;
            String reviewResult = reviewName != null ? namesService.getReviewName(reviewName) : null;

            String response = String.format("{\"playerName\":%s,\"reviewName\":%s}",
                    playerResult != null ? "\"" + playerResult + "\"" : "null",
                    reviewResult != null ? "\"" + reviewResult + "\"" : "null");

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Error procesando solicitud: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/check")
    public ResponseEntity<String> checkPlayer(@RequestParam String playerName) {
        // Respuesta estática, sin llamadas a API
        String playerResult = namesService.getPlayerName(playerName);
        return new ResponseEntity<>("El jugador " + playerResult + " existe en el sistema (respuesta estática)",
                HttpStatus.OK);
    }
}
