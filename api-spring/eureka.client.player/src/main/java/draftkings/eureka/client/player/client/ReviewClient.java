package draftkings.eureka.client.player.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.*;
import java.util.Collections;
import java.util.List;

import draftkings.eureka.client.player.dto.ReviewDTO;

@FeignClient(value = "reviewMS", fallback = ReviewClient.ReviewFallback.class)
public interface ReviewClient {

    @GetMapping("/check")
    String checkReview(@RequestParam("reviewName") String reviewName);

    // Modificamos la ruta para que coincida con la del ReviewMS
    @GetMapping("/api/players/{playerId}/reviews")
    List<ReviewDTO> getReviewsByPlayerId(@PathVariable("playerId") Long playerId);

    @PostMapping("/api/players/{playerId}/reviews")
    ReviewDTO createReview(@PathVariable("playerId") Long playerId, @RequestBody ReviewDTO review);

    @PutMapping("/api/reviews/{id}")
    ReviewDTO updateReview(@PathVariable("id") Long id, @RequestBody ReviewDTO reviewDetails);

    @DeleteMapping("/api/reviews/{id}")
    void deleteReview(@PathVariable("id") Long id);

    @Component
    class ReviewFallback implements ReviewClient {
        @Override
        public List<ReviewDTO> getReviewsByPlayerId(Long playerId) {
            return Collections.emptyList();
        }

        @Override
        public String checkReview(String reviewName) {
            return "Review service unavailable";
        }

        @Override
        public ReviewDTO createReview(Long playerId, ReviewDTO review) {
            // Si está caído, devolvemos null para poder lanzar un 503 desde el controller
            return null; 
        }

        @Override
        public ReviewDTO updateReview(Long id, ReviewDTO reviewDetails) {
            return null;
        }

        @Override
        public void deleteReview(Long id) {
            // No hacemos nada, el fallo silencioso previene caídas en cadena
        }
    }
}