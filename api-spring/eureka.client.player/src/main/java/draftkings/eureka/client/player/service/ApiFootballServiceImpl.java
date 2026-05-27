package draftkings.eureka.client.player.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import draftkings.eureka.client.player.dto.PlayerExternalDTO;
import org.springframework.beans.factory.annotation.Value;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.boot.restclient.RestTemplateBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;

@Service
public class ApiFootballServiceImpl implements ApiFootballService {

    @Value("${api.football.key}")
    private String apiKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public ApiFootballServiceImpl(RestTemplateBuilder restTemplateBuilder, ObjectMapper objectMapper) {
        this.restTemplate = restTemplateBuilder.build();
        this.objectMapper = objectMapper;
    }

    @Override
    @CircuitBreaker(name = "apiFootball", fallbackMethod = "searchExternalPlayersFallback")
    public List<PlayerExternalDTO> searchExternalPlayers(String search) {
        String url = "https://v3.football.api-sports.io/players/profiles";

        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(url);
        if (search != null && !search.isEmpty()) {
            builder.queryParam("search", search);
        }
        URI requestUri = builder.build().encode().toUri();

        HttpHeaders headers = new HttpHeaders();
        headers.set("x-apisports-key", apiKey);
        headers.set("x-rapidapi-host", "v3.football.api-sports.io");

        HttpEntity<?> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    requestUri,
                    HttpMethod.GET,
                    entity,
                    String.class);

            JsonNode root = response.getBody() == null ? null : objectMapper.readTree(response.getBody());
            return mapResponseToDTOList(root);
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch players from external API", e);
        }
    }

    @SuppressWarnings("unused")
    public List<PlayerExternalDTO> searchExternalPlayersFallback(String search, Throwable throwable) {
        System.err.println("API-Football is down or unavailable: " + throwable.getMessage());
        return List.of();
    }

    private List<PlayerExternalDTO> mapResponseToDTOList(JsonNode root) {
        List<PlayerExternalDTO> resultList = new ArrayList<>();
        if (root == null || !root.has("response")) {
            return resultList;
        }

        JsonNode responseArray = root.get("response");
        for (JsonNode item : responseArray) {
            JsonNode playerNode = item.get("player");
            if (playerNode == null) {
                continue;
            }

            PlayerExternalDTO dto = new PlayerExternalDTO();
            dto.setName(playerNode.path("name").asText(null));
            dto.setFirstName(playerNode.path("firstname").asText(""));
            dto.setLastName(playerNode.path("lastname").asText(""));

            if (!playerNode.path("age").isMissingNode() && !playerNode.path("age").isNull()) {
                dto.setAge(playerNode.path("age").asInt());
            }

            JsonNode birthNode = playerNode.get("birth");
            if (birthNode != null && !birthNode.path("date").isNull()) {
                dto.setBirthdate(birthNode.path("date").asText());
            }

            dto.setNationality(playerNode.path("nationality").asText(""));
            dto.setPosition(playerNode.path("position").asText(""));
            dto.setPhotoUrl(playerNode.path("photo").asText(""));

            if (!playerNode.path("height").isMissingNode() && !playerNode.path("height").isNull()) {
                String heightRaw = playerNode.path("height").asText();
                // Eliminamos todo lo que NO sea un número o un punto (ej. "185 cm" -> "185")
                String heightClean = heightRaw.replaceAll("[^0-9.]", "").trim();
                if (!heightClean.isEmpty()) {
                    dto.setHeight(new java.math.BigDecimal(heightClean));
                }
            }

            if (!playerNode.path("weight").isMissingNode() && !playerNode.path("weight").isNull()) {
                String weightRaw = playerNode.path("weight").asText();
                // Eliminamos todo lo que NO sea un número o un punto (ej. "78 kg" -> "78")
                String weightClean = weightRaw.replaceAll("[^0-9.]", "").trim();
                if (!weightClean.isEmpty()) {
                    dto.setWeight(new java.math.BigDecimal(weightClean));
                }
            }

            if (!playerNode.path("number").isMissingNode() && !playerNode.path("number").isNull()) {
                // Protegemos la lectura del dorsal asegurando que no esté vacío
                String numberText = playerNode.path("number").asText().trim();
                if (!numberText.isEmpty() && !numberText.equalsIgnoreCase("null")) {
                    dto.setNumber(playerNode.path("number").asInt());
                }
            }

            resultList.add(dto);
        }
        return resultList;
    }
}
