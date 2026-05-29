package draftkings.eureka.client.player.controller;

import draftkings.eureka.client.player.dto.TacticRecommendationRequestDTO;
import draftkings.eureka.client.player.dto.TacticRecommendationResponseDTO;
import draftkings.eureka.client.player.exception.BadRequestException;
import draftkings.eureka.client.player.service.AiTacticService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TacticControllerTest {

    @Mock
    private AiTacticService aiTacticService;

    private TacticController tacticController;

    @BeforeEach
    void setUp() {
        tacticController = new TacticController(aiTacticService);
    }

    @Test
    void getAiRecommendationsShouldThrowBadRequestWhenRequestInvalid() {
        assertThrows(BadRequestException.class, () -> tacticController.getAiRecommendations(null));
        assertThrows(BadRequestException.class,
                () -> tacticController.getAiRecommendations(new TacticRecommendationRequestDTO(null)));
        assertThrows(BadRequestException.class,
                () -> tacticController.getAiRecommendations(new TacticRecommendationRequestDTO(Map.of())));

        verifyNoInteractions(aiTacticService);
    }

    @Test
    void getAiRecommendationsShouldReturnOkWhenRequestValid() {
        TacticRecommendationRequestDTO request = new TacticRecommendationRequestDTO(Map.of("GK", "Alisson", "ST", ""));
        TacticRecommendationResponseDTO expected = new TacticRecommendationResponseDTO(
                "Based on your team structure", Map.of("ST", "Haaland"));

        when(aiTacticService.getRecommendations(request.positions())).thenReturn(expected);

        ResponseEntity<?> response = tacticController.getAiRecommendations(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof TacticRecommendationResponseDTO);
        TacticRecommendationResponseDTO body = (TacticRecommendationResponseDTO) response.getBody();
        assertEquals("Haaland", body.recommendations().get("ST"));
    }
}
