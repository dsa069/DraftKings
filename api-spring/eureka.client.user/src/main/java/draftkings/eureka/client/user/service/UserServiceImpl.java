package draftkings.eureka.client.user.service;

import org.springframework.stereotype.Service;
import draftkings.eureka.client.user.client.ReviewClient;
import draftkings.eureka.client.user.domain.User;
import draftkings.eureka.client.user.dto.ReviewDTO;
import draftkings.eureka.client.user.dto.UserDetailResponseDTO;
import draftkings.eureka.client.user.repository.UserRepository;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final ReviewClient reviewFeignClient;

    public UserServiceImpl(UserRepository userRepository, ReviewClient reviewFeignClient) {
        this.userRepository = userRepository;
        this.reviewFeignClient = reviewFeignClient;
    }

    @Override
    public UserDetailResponseDTO getUserProfileWithReviews(Long userId) {
        // 1. Fetch user from local database
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // 2. Fetch reviews from Review microservice via Feign
        // If Review service is down, Fallback returns empty list
        List<ReviewDTO> reviews = reviewFeignClient.getReviewsByUserId(userId);

        // 3. Package and return composite DTO
        return new UserDetailResponseDTO(user, reviews);
    }
}
