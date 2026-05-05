package draftkings.eureka.client.review.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

@RestController
public class ReviewController {

    @GetMapping("/check")
    public ResponseEntity<String> checkReview(@RequestParam String reviewName) {
        // Respuesta estática, sin llamadas a API
        return new ResponseEntity<>("La reseña " + reviewName + " existe en el sistema (respuesta estática)",
                HttpStatus.OK);
    }
}
