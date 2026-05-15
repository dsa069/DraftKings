package draftkings.eureka.client.user.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import draftkings.eureka.client.user.client.ReviewClient;

@Service
public class NamesServiceImpl implements NamesService {
    @Autowired
    private ReviewClient reviewClient;

    @Override
    public String getUserName(String userName) {
        try {
            // Devolver el nombre tal como se recibe (testing mode)
            return userName;
        } catch (Exception e) {
            return null;
        }
    }

    @Override
    public String getReviewName(String reviewName) {
        try {
            return reviewClient.checkReview(reviewName);
        } catch (Exception e) {
            return null;
        }
    }
}
