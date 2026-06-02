package draftkings.eureka.client.user.dto;

import draftkings.eureka.client.user.domain.User;
import java.util.List;

public class UserDetailResponseDTO {
    private User user;
    private List<ReviewDTO> reviews;

    public UserDetailResponseDTO() {
    }

    public UserDetailResponseDTO(User user, List<ReviewDTO> reviews) {
        this.user = user;
        this.reviews = reviews;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public List<ReviewDTO> getReviews() {
        return reviews;
    }

    public void setReviews(List<ReviewDTO> reviews) {
        this.reviews = reviews;
    }
}
