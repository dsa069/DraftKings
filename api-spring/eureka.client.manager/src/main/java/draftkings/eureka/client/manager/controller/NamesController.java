package draftkings.eureka.client.manager.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import draftkings.eureka.client.manager.service.NamesService;

@RestController
public class NamesController {

    @Autowired
    NamesService namesService;

    @PostMapping("/names")
    public ResponseEntity<String> insertName(@RequestBody String requestBody) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode jsonNode = mapper.readTree(requestBody);

            String playerName = jsonNode.has("playerName") ? jsonNode.get("playerName").asText() : null;
            String reviewName = jsonNode.has("reviewName") ? jsonNode.get("reviewName").asText() : null;

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
}
