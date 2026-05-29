package draftkings.eureka.client.player.controller;

import draftkings.eureka.client.player.client.ReviewClient;
import draftkings.eureka.client.player.domain.Player;
import draftkings.eureka.client.player.dto.PlayerDetailResponseDTO;
import draftkings.eureka.client.player.dto.PlayerExternalDTO;
import draftkings.eureka.client.player.dto.ReviewDTO;
import draftkings.eureka.client.player.exception.BadRequestException;
import draftkings.eureka.client.player.exception.ResourceNotFoundException;
import draftkings.eureka.client.player.exception.ServiceUnavailableException;
import draftkings.eureka.client.player.repository.PlayerRepository;
import draftkings.eureka.client.player.service.ApiFootballService;
import draftkings.eureka.client.player.service.PlayerService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PlayerControllerTest {

    @Mock
    private PlayerRepository playerRepository;

    @Mock
    private PlayerService playerService;

    @Mock
    private ApiFootballService apiFootballService;

    @Mock
    private ReviewClient reviewClient;

    private PlayerController controller;

    @BeforeEach
    void setUp() {
        controller = new PlayerController(playerRepository, playerService, apiFootballService, reviewClient);
    }

    @Test
    void getAllPlayersShouldThrowBadRequestWhenPaginationInvalid() {
        assertThrows(BadRequestException.class,
                () -> controller.getAllPlayers(null, null, null, null, -1, 10));
        assertThrows(BadRequestException.class,
                () -> controller.getAllPlayers(null, null, null, null, 0, 0));
    }

    @Test
    void getAllPlayersShouldDelegateToRepositoryWithFilters() {
        Page<Player> page = new PageImpl<>(List.of(new Player()), PageRequest.of(1, 5), 1);
        when(playerRepository.findAllWithFilters(any(), any(), any(), any(), any())).thenReturn(page);

        ResponseEntity<Page<Player>> response = controller.getAllPlayers(
                "messi", "Inter Miami", "MLS", LocalDate.of(2026, 5, 1), 1, 5);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().getContent().size());
        assertEquals(1, response.getBody().getNumber());

        ArgumentCaptor<Date> startDateCaptor = ArgumentCaptor.forClass(Date.class);
        verify(playerRepository).findAllWithFilters(
                eq("messi"),
                eq("Inter Miami"),
                eq("MLS"),
                startDateCaptor.capture(),
                any());

        assertEquals(java.sql.Date.valueOf(LocalDate.of(2026, 5, 1)), startDateCaptor.getValue());
    }

    @Test
    void getPlayerByIdShouldThrowBadRequestWhenIdInvalid() {
        assertThrows(BadRequestException.class, () -> controller.getPlayerById(0L));
        verifyNoInteractions(playerService);
    }

    @Test
    void getPlayerByIdShouldReturnDetailWhenIdValid() {
        Player player = validPlayer();
        PlayerDetailResponseDTO dto = new PlayerDetailResponseDTO(player, List.of());
        when(playerService.getPlayerProfileWithReviews(1L)).thenReturn(dto);

        ResponseEntity<PlayerDetailResponseDTO> response = controller.getPlayerById(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Neymar", response.getBody().getPlayer().getName());
    }

    @Test
    void createPlayerShouldThrowBadRequestWhenPayloadNull() {
        assertThrows(BadRequestException.class, () -> controller.createPlayer(null));
    }

    @Test
    void createPlayerShouldSetCreatedAtIfMissing() {
        Player player = validPlayer();
        player.setCreatedAt(null);
        when(playerRepository.save(any(Player.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ResponseEntity<Player> response = controller.createPlayer(player);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody().getCreatedAt());
    }

    @Test
    void updatePlayerShouldThrowBadRequestWhenIdInvalid() {
        assertThrows(BadRequestException.class, () -> controller.updatePlayer(0L, new Player()));
    }

    @Test
    void updatePlayerShouldReturnUpdatedPlayer() {
        Player updated = validPlayer();
        updated.setTeam("PSG");
        when(playerService.updatePlayerPartial(eq(1L), any(Player.class))).thenReturn(updated);

        ResponseEntity<Player> response = controller.updatePlayer(1L, new Player());

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("PSG", response.getBody().getTeam());
    }

    @Test
    void deletePlayerShouldDeleteWhenExists() {
        when(playerRepository.existsById(1L)).thenReturn(true);

        ResponseEntity<Void> response = controller.deletePlayer(1L);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(playerRepository).deleteById(1L);
    }

    @Test
    void deletePlayerShouldThrowNotFoundWhenPlayerMissing() {
        when(playerRepository.existsById(1L)).thenReturn(false);

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class, () -> controller.deletePlayer(1L));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void getExternalPlayersShouldReturnDataFromService() {
        PlayerExternalDTO dto = new PlayerExternalDTO();
        dto.setName("Ronaldo");
        when(apiFootballService.searchExternalPlayers("ronaldo")).thenReturn(List.of(dto));

        ResponseEntity<List<PlayerExternalDTO>> response = controller.getExternalPlayers("ronaldo");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
        assertEquals("Ronaldo", response.getBody().get(0).getName());
    }

    @Test
    void importPlayersShouldThrowBadRequestWhenBodyEmpty() {
        assertThrows(BadRequestException.class, () -> controller.importPlayers(List.of()));
        assertThrows(BadRequestException.class, () -> controller.importPlayers(null));
    }

    @Test
    void importPlayersShouldSetCreatedAtAndPersistList() {
        Player p1 = validPlayer();
        p1.setCreatedAt(null);
        Player p2 = validPlayer();
        p2.setName("Vinicius");

        when(playerRepository.saveAll(anyIterable())).thenAnswer(invocation -> invocation.getArgument(0));

        ResponseEntity<Void> response = controller.importPlayers(List.of(p1, p2));

        assertEquals(HttpStatus.CREATED, response.getStatusCode());

        ArgumentCaptor<List<Player>> listCaptor = ArgumentCaptor.forClass(List.class);
        verify(playerRepository).saveAll(listCaptor.capture());
        assertNotNull(listCaptor.getValue().get(0).getCreatedAt());
        assertNotNull(listCaptor.getValue().get(1).getCreatedAt());
    }

    @Test
    void getPlayerReviewsShouldValidateIdAndExistence() {
        assertThrows(BadRequestException.class, () -> controller.getPlayerReviews(0L));

        when(playerRepository.existsById(1L)).thenReturn(false);
        assertThrows(ResourceNotFoundException.class, () -> controller.getPlayerReviews(1L));
    }

    @Test
    void getPlayerReviewsShouldReturnReviewsWhenPlayerExists() {
        ReviewDTO review = new ReviewDTO();
        review.setText("Top");

        when(playerRepository.existsById(2L)).thenReturn(true);
        when(reviewClient.getReviewsByPlayerId(2L)).thenReturn(List.of(review));

        ResponseEntity<List<ReviewDTO>> response = controller.getPlayerReviews(2L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
        assertEquals("Top", response.getBody().get(0).getText());
    }

    @Test
    void createPlayerReviewShouldValidatePayloadAndHandleFallbackNull() {
        assertThrows(BadRequestException.class, () -> controller.createPlayerReview(1L, null));

        ReviewDTO invalid = new ReviewDTO();
        invalid.setText("   ");
        invalid.setRating(5);
        assertThrows(BadRequestException.class, () -> controller.createPlayerReview(1L, invalid));

        ReviewDTO valid = new ReviewDTO();
        valid.setText("Great");
        valid.setRating(5);
        when(reviewClient.createReview(1L, valid)).thenReturn(null);

        assertThrows(ServiceUnavailableException.class, () -> controller.createPlayerReview(1L, valid));
    }

    @Test
    void createPlayerReviewShouldReturnCreatedWhenSuccessful() {
        ReviewDTO req = new ReviewDTO();
        req.setText("Solid match");
        req.setRating(4);

        ReviewDTO created = new ReviewDTO();
        created.setId(55L);
        created.setText("Solid match");
        created.setRating(4);

        when(reviewClient.createReview(1L, req)).thenReturn(created);

        ResponseEntity<ReviewDTO> response = controller.createPlayerReview(1L, req);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(55L, response.getBody().getId());
    }

    private Player validPlayer() {
        Player player = new Player();
        player.setId(1L);
        player.setName("Neymar");
        player.setTeam("Santos");
        player.setLeague("Brasileirao");
        player.setLatitude(new BigDecimal("-23.5505"));
        player.setLongitude(new BigDecimal("-46.6333"));
        player.setCreatedAt(new Date());
        return player;
    }
}
