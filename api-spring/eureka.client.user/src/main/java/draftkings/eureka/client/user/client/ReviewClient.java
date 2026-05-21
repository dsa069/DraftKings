package draftkings.eureka.client.user.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import draftkings.eureka.client.user.dto.ReviewDTO;

import java.util.Collections;
import java.util.List;

@FeignClient(value = "reviewMS", fallback = ReviewClient.ReviewFallback.class)
public interface ReviewClient {

    @GetMapping("/check")
    public String checkReview(@RequestParam("reviewName") String reviewName);

    @GetMapping
    List<ReviewDTO> getReviewsByUserId(@RequestParam("userId") Long userId);

    @Component
    class ReviewFallback implements ReviewClient {
        @Override
        public List<ReviewDTO> getReviewsByUserId(Long userId) {
            return Collections.emptyList();
        }

        @Override
        public String checkReview(String reviewName) {
            return "Review service unavailable";
        }
    }
}
