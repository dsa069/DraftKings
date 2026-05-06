package draftkings.eureka.client.manager.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient("Player_ms")
public interface PlayerClient {

    @GetMapping("/check")
    public String checkPlayer(@RequestParam("playerName") String playerName);

}
