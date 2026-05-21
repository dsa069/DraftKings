package draftkings.eureka.client.user.service;

import draftkings.eureka.client.user.dto.UserDetailResponseDTO;

public interface UserService {
    UserDetailResponseDTO getUserProfileWithReviews(Long userId);
}
