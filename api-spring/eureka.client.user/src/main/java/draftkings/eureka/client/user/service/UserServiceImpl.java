package draftkings.eureka.client.user.service;

import org.springframework.stereotype.Service;
import draftkings.eureka.client.user.client.ReviewClient;
import draftkings.eureka.client.user.domain.User;
import draftkings.eureka.client.user.dto.ReviewDTO;
import draftkings.eureka.client.user.dto.UserDetailResponseDTO;
import draftkings.eureka.client.user.exception.InternalServerErrorException;
import draftkings.eureka.client.user.exception.ResourceNotFoundException;
import draftkings.eureka.client.user.repository.UserRepository;
import org.springframework.http.HttpStatus;

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
                .orElseThrow(() -> new ResourceNotFoundException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        // 2. Fetch reviews from Review microservice via Feign
        List<ReviewDTO> reviews;
        try {
            reviews = reviewFeignClient.getReviewsByUserId(userId);
        } catch (Exception ex) {
            throw new InternalServerErrorException("Error fetching user reviews", ex);
        }

        // 3. Package and return composite DTO
        return new UserDetailResponseDTO(user, reviews);
    }
}
