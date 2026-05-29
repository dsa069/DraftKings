package draftkings.eureka.client.player.service;

import draftkings.eureka.client.player.client.ReviewClient;
import draftkings.eureka.client.player.domain.Player;
import draftkings.eureka.client.player.dto.PlayerDetailResponseDTO;
import draftkings.eureka.client.player.dto.ReviewDTO;
import draftkings.eureka.client.player.exception.BadRequestException;
import draftkings.eureka.client.player.exception.ResourceNotFoundException;
import draftkings.eureka.client.player.repository.PlayerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PlayerServiceImplTest {

    @Mock
    private PlayerRepository playerRepository;

    @Mock
    private ReviewClient reviewClient;

    @InjectMocks
    private PlayerServiceImpl playerService;

    private Player player;

    @BeforeEach
    void setUp() {
        player = new Player();
        player.setId(1L);
        player.setName("Lionel Messi");
        player.setTeam("Inter Miami");
        player.setLeague("MLS");
        player.setLatitude(new BigDecimal("25.7617"));
        player.setLongitude(new BigDecimal("-80.1918"));
        player.setCreatedAt(new Date());
    }

    @Test
    void getPlayerProfileWithReviewsShouldThrowBadRequestWhenIdInvalid() {
        assertThrows(BadRequestException.class, () -> playerService.getPlayerProfileWithReviews(0L));
        assertThrows(BadRequestException.class, () -> playerService.getPlayerProfileWithReviews(null));
        verifyNoInteractions(playerRepository, reviewClient);
    }

    @Test
    void getPlayerProfileWithReviewsShouldThrowNotFoundWhenPlayerDoesNotExist() {
        when(playerRepository.findById(99L)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(
                ResourceNotFoundException.class,
                () -> playerService.getPlayerProfileWithReviews(99L));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        verify(playerRepository).findById(99L);
        verifyNoInteractions(reviewClient);
    }

    @Test
    void getPlayerProfileWithReviewsShouldReturnEmptyReviewsWhenFeignReturnsNull() {
        when(playerRepository.findById(1L)).thenReturn(Optional.of(player));
        when(reviewClient.getReviewsByPlayerId(1L)).thenReturn(null);

        PlayerDetailResponseDTO response = playerService.getPlayerProfileWithReviews(1L);

        assertNotNull(response);
        assertEquals(player, response.getPlayer());
        assertNotNull(response.getReviews());
        assertTrue(response.getReviews().isEmpty());
    }

    @Test
    void getPlayerProfileWithReviewsShouldReturnEmptyReviewsWhenFeignFails() {
        when(playerRepository.findById(1L)).thenReturn(Optional.of(player));
        when(reviewClient.getReviewsByPlayerId(1L)).thenThrow(new RuntimeException("review service down"));

        PlayerDetailResponseDTO response = playerService.getPlayerProfileWithReviews(1L);

        assertNotNull(response);
        assertEquals(player, response.getPlayer());
        assertTrue(response.getReviews().isEmpty());
    }

    @Test
    void getPlayerProfileWithReviewsShouldReturnPlayerAndReviews() {
        ReviewDTO review = new ReviewDTO();
        review.setId(10L);
        review.setText("Great player");
        review.setRating(5);

        when(playerRepository.findById(1L)).thenReturn(Optional.of(player));
        when(reviewClient.getReviewsByPlayerId(1L)).thenReturn(List.of(review));

        PlayerDetailResponseDTO response = playerService.getPlayerProfileWithReviews(1L);

        assertNotNull(response);
        assertEquals(player, response.getPlayer());
        assertEquals(1, response.getReviews().size());
        assertEquals("Great player", response.getReviews().get(0).getText());
    }

    @Test
    void updatePlayerPartialShouldThrowBadRequestWhenIdInvalidOrPayloadNull() {
        assertThrows(BadRequestException.class, () -> playerService.updatePlayerPartial(0L, new Player()));
        assertThrows(BadRequestException.class, () -> playerService.updatePlayerPartial(1L, null));
        verifyNoInteractions(playerRepository);
    }

    @Test
    void updatePlayerPartialShouldThrowNotFoundWhenPlayerDoesNotExist() {
        when(playerRepository.findById(77L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> playerService.updatePlayerPartial(77L, new Player()));
        verify(playerRepository).findById(77L);
        verify(playerRepository, never()).save(any(Player.class));
    }

    @Test
    void updatePlayerPartialShouldMergeOnlyProvidedFieldsAndSave() {
        Player updates = new Player();
        updates.setTeam("Barcelona");
        updates.setNumber(10);
        updates.setFirstName("Leo");
        updates.setHeight(new BigDecimal("1.70"));

        when(playerRepository.findById(1L)).thenReturn(Optional.of(player));
        when(playerRepository.save(any(Player.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Player saved = playerService.updatePlayerPartial(1L, updates);

        assertEquals("Barcelona", saved.getTeam());
        assertEquals("MLS", saved.getLeague());
        assertEquals(10, saved.getNumber());
        assertEquals("Leo", saved.getFirstName());
        assertEquals(new BigDecimal("1.70"), saved.getHeight());
        assertEquals("Lionel Messi", saved.getName());
        verify(playerRepository).save(player);
    }
}
