package draftkings.eureka.client.player.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import draftkings.eureka.client.player.dto.PlayerExternalDTO;
import draftkings.eureka.client.player.exception.ServiceUnavailableException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.restclient.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApiFootballServiceImplTest {

    @Mock
    private RestTemplateBuilder restTemplateBuilder;

    @Mock
    private RestTemplate restTemplate;

    private ApiFootballServiceImpl service;

    @BeforeEach
    void setUp() {
        when(restTemplateBuilder.build()).thenReturn(restTemplate);
        service = new ApiFootballServiceImpl(restTemplateBuilder, new ObjectMapper());
        ReflectionTestUtils.setField(service, "apiKey", "test-api-key");
    }

    @Test
    void searchExternalPlayersShouldMapResponseCorrectly() {
        String body = """
                {
                  "response": [
                    {
                      "player": {
                        "name": "Kylian Mbappe",
                        "firstname": "Kylian",
                        "lastname": "Mbappe",
                        "age": 26,
                        "birth": { "date": "1998-12-20" },
                        "nationality": "France",
                        "position": "Attacker",
                        "photo": "https://img/player.png",
                        "height": "178 cm",
                        "weight": "73 kg",
                        "number": "10"
                      }
                    }
                  ]
                }
                """;

        when(restTemplate.exchange(any(URI.class), eq(HttpMethod.GET), any(HttpEntity.class), eq(String.class)))
                .thenReturn(ResponseEntity.ok(body));

        List<PlayerExternalDTO> players = service.searchExternalPlayers("mbappe");

        assertEquals(1, players.size());
        PlayerExternalDTO dto = players.get(0);
        assertEquals("Kylian Mbappe", dto.getName());
        assertEquals("Kylian", dto.getFirstName());
        assertEquals("Mbappe", dto.getLastName());
        assertEquals(26, dto.getAge());
        assertEquals("1998-12-20", dto.getBirthdate());
        assertEquals("France", dto.getNationality());
        assertEquals("Attacker", dto.getPosition());
        assertEquals("https://img/player.png", dto.getPhotoUrl());
        assertEquals("178", dto.getHeight().toPlainString());
        assertEquals("73", dto.getWeight().toPlainString());
        assertEquals(10, dto.getNumber());

        ArgumentCaptor<URI> uriCaptor = ArgumentCaptor.forClass(URI.class);
        ArgumentCaptor<HttpEntity> entityCaptor = ArgumentCaptor.forClass(HttpEntity.class);
        verify(restTemplate).exchange(uriCaptor.capture(), eq(HttpMethod.GET), entityCaptor.capture(),
                eq(String.class));

        assertTrue(uriCaptor.getValue().toString().contains("search=mbappe"));
        assertEquals("test-api-key", entityCaptor.getValue().getHeaders().getFirst("x-apisports-key"));
    }

    @Test
    void searchExternalPlayersShouldReturnEmptyListWhenResponseNodeMissing() {
        when(restTemplate.exchange(any(URI.class), eq(HttpMethod.GET), any(HttpEntity.class), eq(String.class)))
                .thenReturn(ResponseEntity.ok("{}"));

        List<PlayerExternalDTO> players = service.searchExternalPlayers("any");

        assertNotNull(players);
        assertTrue(players.isEmpty());
    }

    @Test
    void searchExternalPlayersShouldThrowServiceUnavailableWhenExternalCallFails() {
        when(restTemplate.exchange(any(URI.class), eq(HttpMethod.GET), any(HttpEntity.class), eq(String.class)))
                .thenThrow(new RuntimeException("timeout"));

        ServiceUnavailableException ex = assertThrows(
                ServiceUnavailableException.class,
                () -> service.searchExternalPlayers("messi"));

        assertEquals("Failed to fetch players from external API", ex.getMessage());
    }

    @Test
    void searchExternalPlayersFallbackShouldThrowServiceUnavailable() {
        ServiceUnavailableException ex = assertThrows(
                ServiceUnavailableException.class,
                () -> service.searchExternalPlayersFallback("messi", new RuntimeException("circuit open")));

        assertEquals("Failed to fetch players from external API", ex.getMessage());
        assertNotNull(ex.getCause());
    }
}
