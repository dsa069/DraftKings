package draftkings.eureka.client.player.service;

import draftkings.eureka.client.player.dto.TacticRecommendationResponseDTO;
import draftkings.eureka.client.player.exception.BadRequestException;
import draftkings.eureka.client.player.exception.ServiceUnavailableException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;

import java.util.LinkedHashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AiTacticServiceImplTest {

    @Mock
    private ChatModel chatModel;

    @Test
    void getRecommendationsShouldReturnParsedResponseWhenAiReturnsValidJson() {
        AiTacticServiceImpl service = new AiTacticServiceImpl(chatModel);

        ChatResponse chatResponse = mock(ChatResponse.class, RETURNS_DEEP_STUBS);
        when(chatModel.call(any(Prompt.class))).thenReturn(chatResponse);
        when(chatResponse.getResult().getOutput().getText())
                .thenReturn(
                        "{\"message\":\"Based on your current setup\",\"recommendations\":{\"ST\":\"Harry Kane\"}}");

        Map<String, String> positions = new LinkedHashMap<>();
        positions.put("GK", "Ter Stegen");
        positions.put("ST", null);

        TacticRecommendationResponseDTO response = service.getRecommendations(positions);

        assertNotNull(response);
        assertTrue(response.message().startsWith("Based on"));
        assertEquals("Harry Kane", response.recommendations().get("ST"));
        verify(chatModel).call(any(Prompt.class));
    }

    @Test
    void getRecommendationsShouldThrowBadRequestWhenNoEmptyPositions() {
        AiTacticServiceImpl service = new AiTacticServiceImpl(chatModel);

        Map<String, String> positions = Map.of(
                "GK", "Oblak",
                "ST", "Lewandowski");

        BadRequestException ex = assertThrows(BadRequestException.class, () -> service.getRecommendations(positions));

        assertEquals("NO_EMPTY_POSITIONS", ex.getMessage());
        verifyNoInteractions(chatModel);
    }

    @Test
    void getRecommendationsShouldThrowServiceUnavailableWhenAiFails() {
        AiTacticServiceImpl service = new AiTacticServiceImpl(chatModel);
        when(chatModel.call(any(Prompt.class))).thenThrow(new RuntimeException("provider down"));

        Map<String, String> positions = new LinkedHashMap<>();
        positions.put("GK", "Ederson");
        positions.put("CM", null);

        ServiceUnavailableException ex = assertThrows(
                ServiceUnavailableException.class,
                () -> service.getRecommendations(positions));

        assertEquals("AI_SERVICE_ERROR", ex.getMessage());
        assertNotNull(ex.getCause());
    }
}
