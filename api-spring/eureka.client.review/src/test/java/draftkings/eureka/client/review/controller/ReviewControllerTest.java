package draftkings.eureka.client.review.controller;

import draftkings.eureka.client.review.domain.Review;
import draftkings.eureka.client.review.exception.BadRequestException;
import draftkings.eureka.client.review.exception.InternalServerErrorException;
import draftkings.eureka.client.review.exception.ResourceNotFoundException;
import draftkings.eureka.client.review.repository.ReviewRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewControllerTest {

    @Mock
    private ReviewRepository reviewRepository;

    private ReviewController reviewController;

    @BeforeEach
    void setUp() {
        reviewController = new ReviewController(reviewRepository);
    }

    @Test
    void getReviewsByPlayerShouldThrowBadRequestWhenIdInvalid() {
        assertThrows(BadRequestException.class, () -> reviewController.getReviewsByPlayer(0L));
        verifyNoInteractions(reviewRepository);
    }

    @Test
    void getReviewsByPlayerShouldThrowNotFoundWhenNoReviews() {
        when(reviewRepository.findByPlayerId(99L)).thenReturn(List.of());

        ResourceNotFoundException ex = assertThrows(
                ResourceNotFoundException.class,
                () -> reviewController.getReviewsByPlayer(99L));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void getReviewsByPlayerShouldThrowInternalErrorWhenRepositoryFails() {
        when(reviewRepository.findByPlayerId(1L)).thenThrow(new RuntimeException("db down"));

        InternalServerErrorException ex = assertThrows(
                InternalServerErrorException.class,
                () -> reviewController.getReviewsByPlayer(1L));

        assertEquals("Error loading reviews", ex.getMessage());
        assertNotNull(ex.getCause());
    }

    @Test
    void getReviewsByPlayerShouldReturnReviewsWhenFound() {
        Review review = buildReview();
        when(reviewRepository.findByPlayerId(1L)).thenReturn(List.of(review));

        ResponseEntity<List<Review>> response = reviewController.getReviewsByPlayer(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
        assertEquals("Great match", response.getBody().get(0).getText());
    }

    @Test
    void createReviewShouldThrowBadRequestWhenPayloadInvalid() {
        assertThrows(BadRequestException.class, () -> reviewController.createReview(1L, null));

        Review invalid = buildReview();
        invalid.setText("  ");
        assertThrows(BadRequestException.class, () -> reviewController.createReview(1L, invalid));

        Review invalidNoRating = buildReview();
        invalidNoRating.setRating(null);
        assertThrows(BadRequestException.class, () -> reviewController.createReview(1L, invalidNoRating));
    }

    @Test
    void createReviewShouldSetPlayerIdAndDefaultUserIdWhenMissing() {
        Review request = buildReview();
        request.setUserId(null);

        when(reviewRepository.save(any(Review.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ResponseEntity<Review> response = reviewController.createReview(25L, request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(25L, response.getBody().getPlayerId());
        assertEquals(1L, response.getBody().getUserId());

        ArgumentCaptor<Review> captor = ArgumentCaptor.forClass(Review.class);
        verify(reviewRepository).save(captor.capture());
        assertEquals(25L, captor.getValue().getPlayerId());
        assertEquals(1L, captor.getValue().getUserId());
    }

    @Test
    void createReviewShouldKeepIncomingUserIdWhenProvided() {
        Review request = buildReview();
        request.setUserId(88L);
        when(reviewRepository.save(any(Review.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ResponseEntity<Review> response = reviewController.createReview(9L, request);

        assertEquals(88L, response.getBody().getUserId());
        assertEquals(9L, response.getBody().getPlayerId());
    }

    @Test
    void createReviewShouldThrowInternalErrorWhenRepositoryFails() {
        when(reviewRepository.save(any(Review.class))).thenThrow(new RuntimeException("insert error"));

        InternalServerErrorException ex = assertThrows(
                InternalServerErrorException.class,
                () -> reviewController.createReview(3L, buildReview()));

        assertEquals("Error creating review", ex.getMessage());
    }

    @Test
    void updateReviewShouldThrowBadRequestWhenIdOrPayloadInvalid() {
        assertThrows(BadRequestException.class, () -> reviewController.updateReview(0L, buildReview()));
        assertThrows(BadRequestException.class, () -> reviewController.updateReview(1L, null));

        Review noChanges = new Review();
        noChanges.setText(null);
        noChanges.setRating(null);
        assertThrows(BadRequestException.class, () -> reviewController.updateReview(1L, noChanges));
    }

    @Test
    void updateReviewShouldThrowNotFoundWhenReviewMissing() {
        when(reviewRepository.findById(404L)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(
                ResourceNotFoundException.class,
                () -> reviewController.updateReview(404L, buildReview()));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void updateReviewShouldThrowInternalErrorWhenLoadingFails() {
        when(reviewRepository.findById(1L)).thenThrow(new RuntimeException("db read error"));

        InternalServerErrorException ex = assertThrows(
                InternalServerErrorException.class,
                () -> reviewController.updateReview(1L, buildReview()));

        assertEquals("Error loading review", ex.getMessage());
    }

    @Test
    void updateReviewShouldThrowInternalErrorWhenSaveFails() {
        Review existing = buildReview();
        when(reviewRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(reviewRepository.save(any(Review.class))).thenThrow(new RuntimeException("db write error"));

        InternalServerErrorException ex = assertThrows(
                InternalServerErrorException.class,
                () -> reviewController.updateReview(1L, buildReview()));

        assertEquals("Error updating review", ex.getMessage());
    }

    @Test
    void updateReviewShouldApplyPartialChangesAndReturnUpdatedReview() {
        Review existing = buildReview();
        existing.setText("Old text");
        existing.setRating(2);

        Review patch = new Review();
        patch.setText("Updated text");
        patch.setRating(5);

        when(reviewRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(reviewRepository.save(any(Review.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ResponseEntity<Review> response = reviewController.updateReview(1L, patch);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Updated text", response.getBody().getText());
        assertEquals(5, response.getBody().getRating());
    }

    @Test
    void deleteReviewShouldThrowBadRequestWhenIdInvalid() {
        assertThrows(BadRequestException.class, () -> reviewController.deleteReview(0L));
        verifyNoInteractions(reviewRepository);
    }

    @Test
    void deleteReviewShouldThrowNotFoundWhenReviewMissing() {
        when(reviewRepository.existsById(999L)).thenReturn(false);

        ResourceNotFoundException ex = assertThrows(
                ResourceNotFoundException.class,
                () -> reviewController.deleteReview(999L));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void deleteReviewShouldReturnNoContentWhenReviewExists() {
        when(reviewRepository.existsById(10L)).thenReturn(true);

        ResponseEntity<Void> response = reviewController.deleteReview(10L);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(reviewRepository).deleteById(10L);
    }

    @Test
    void deleteReviewShouldThrowInternalErrorWhenRepositoryFails() {
        when(reviewRepository.existsById(1L)).thenThrow(new RuntimeException("connection reset"));

        InternalServerErrorException ex = assertThrows(
                InternalServerErrorException.class,
                () -> reviewController.deleteReview(1L));

        assertEquals("Error deleting review", ex.getMessage());
    }

    private Review buildReview() {
        Review review = new Review();
        review.setId(1L);
        review.setUserId(7L);
        review.setPlayerId(1L);
        review.setAuthor("Mario");
        review.setText("Great match");
        review.setRating(4);
        review.setLatitude(new BigDecimal("40.4168"));
        review.setLongitude(new BigDecimal("-3.7038"));
        review.setCreatedAt(new Date());
        return review;
    }
}
