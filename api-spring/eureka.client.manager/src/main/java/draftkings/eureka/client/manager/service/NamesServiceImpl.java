package draftkings.eureka.client.manager.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import draftkings.eureka.client.manager.client.PlayerClient;
import draftkings.eureka.client.manager.client.ReviewClient;

@Service
public class NamesServiceImpl implements NamesService {
    @Autowired
    private PlayerClient playerClient;
    @Autowired
    private ReviewClient reviewClient;

    public String getPlayerName(String playerName) {
        try {
            return playerClient.checkPlayer(playerName);
        } catch (Exception e) {
            return null;
        }
    }

    public String getReviewName(String reviewName) {
        try {
            return reviewClient.checkReview(reviewName);
        } catch (Exception e) {
            return null;
        }
    }
}
