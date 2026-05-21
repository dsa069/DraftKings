package draftkings.eureka.client.player.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import java.util.Collections;
import java.util.List;

import draftkings.eureka.client.player.dto.ReviewDTO;

@FeignClient(value = "reviewMS", fallback = ReviewClient.ReviewFallback.class)
public interface ReviewClient {

    @GetMapping("/check")
    public String checkReview(@RequestParam("reviewName") String reviewName);

    @GetMapping
    List<ReviewDTO> getReviewsByPlayerId(@RequestParam("playerId") Long playerId);

    // Clase interna de contingencia (Fallback) en caso de caída del servicio Review
    @Component
    class ReviewFallback implements ReviewClient {
        @Override
        public List<ReviewDTO> getReviewsByPlayerId(Long playerId) {
            // Si el microservicio de Reviews no responde, devolvemos una lista vacía de
            // forma segura
            return Collections.emptyList();
        }

        @Override
        public String checkReview(String reviewName) {
            return "Review service unavailable";
        }
    }

}
