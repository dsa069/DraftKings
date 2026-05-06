package draftkings.eureka.client.manager.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient("Review-ms")
public interface ReviewClient {

    @GetMapping("/check")
    public String checkReview(@RequestParam("reviewName") String reviewName);

}
