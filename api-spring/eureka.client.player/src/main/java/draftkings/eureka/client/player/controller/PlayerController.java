package draftkings.eureka.client.player.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

@RestController
public class PlayerController {

    @GetMapping("/check")
    public ResponseEntity<String> checkPlayer(@RequestParam String playerName) {
        // Respuesta estática, sin llamadas a API
        return new ResponseEntity<>("El jugador " + playerName + " existe en el sistema (respuesta estática)",
                HttpStatus.OK);
    }
}
