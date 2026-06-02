package draftkings.eureka.client.user.service;

import draftkings.eureka.client.user.client.ReviewClient;
import draftkings.eureka.client.user.domain.User;
import draftkings.eureka.client.user.dto.ReviewDTO;
import draftkings.eureka.client.user.dto.UserDetailResponseDTO;
import draftkings.eureka.client.user.exception.InternalServerErrorException;
import draftkings.eureka.client.user.exception.ResourceNotFoundException;
import draftkings.eureka.client.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ReviewClient reviewClient;

    @InjectMocks
    private UserServiceImpl userService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setFirebaseUid("firebase-uid-1");
        user.setEmail("test@mail.com");
        user.setUserName("tester");
        user.setRole("USER");
    }

    @Test
    void getUserProfileWithReviewsShouldThrowNotFoundWhenUserMissing() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(
                ResourceNotFoundException.class,
                () -> userService.getUserProfileWithReviews(99L));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        verify(userRepository).findById(99L);
        verifyNoInteractions(reviewClient);
    }

    @Test
    void getUserProfileWithReviewsShouldThrowInternalErrorWhenReviewServiceFails() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(reviewClient.getReviewsByUserId(1L)).thenThrow(new RuntimeException("review service unavailable"));

        InternalServerErrorException ex = assertThrows(
                InternalServerErrorException.class,
                () -> userService.getUserProfileWithReviews(1L));

        assertEquals("Error fetching user reviews", ex.getMessage());
        assertNotNull(ex.getCause());
    }

    @Test
    void getUserProfileWithReviewsShouldReturnCompositeDto() {
        ReviewDTO review = new ReviewDTO();
        review.setId(10L);
        review.setText("Very good");
        review.setRating(5);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(reviewClient.getReviewsByUserId(1L)).thenReturn(List.of(review));

        UserDetailResponseDTO result = userService.getUserProfileWithReviews(1L);

        assertNotNull(result);
        assertEquals("firebase-uid-1", result.getUser().getFirebaseUid());
        assertEquals(1, result.getReviews().size());
        assertEquals("Very good", result.getReviews().get(0).getText());
    }
}
