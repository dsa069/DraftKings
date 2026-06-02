package draftkings.eureka.client.player.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import draftkings.eureka.client.player.dto.PlayerExternalDTO;
import draftkings.eureka.client.player.exception.ServiceUnavailableException;
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
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
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
            throw new ServiceUnavailableException("Failed to fetch players from external API", e);
        }
    }

    @SuppressWarnings("unused")
    public List<PlayerExternalDTO> searchExternalPlayersFallback(String search, Throwable throwable) {
        System.err.println("API-Football is down or unavailable: " + throwable.getMessage());
        throw new ServiceUnavailableException("Failed to fetch players from external API", throwable);
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

            if (!playerNode.path("id").isMissingNode() && !playerNode.path("id").isNull()) {
                dto.setExternalId(playerNode.path("id").asLong());
            }

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

    @Override
    @CircuitBreaker(name = "apiFootball", fallbackMethod = "resolveTeamAndLeagueFallback")
    public TeamLeagueInfo resolveTeamAndLeague(Long playerId, String nationality) {
        int currentYear = LocalDate.now().getYear();

        String teamsJson;
        try {
            teamsJson = getPlayerTeams(playerId);
        } catch (Exception e) {
            return new TeamLeagueInfo(null, null);
        }

        JsonNode teamsResponse;
        try {
            teamsResponse = objectMapper.readTree(teamsJson).get("response");
        } catch (Exception e) {
            return new TeamLeagueInfo(null, null);
        }

        if (teamsResponse == null || !teamsResponse.isArray()) {
            return new TeamLeagueInfo(null, null);
        }

        String teamName = null;
        Long teamId = null;
        int[] yearsToTry = {currentYear, currentYear - 1};

        for (int year : yearsToTry) {
            boolean foundInYear = false;
            for (JsonNode t : teamsResponse) {
                JsonNode teamNode = t.get("team");
                JsonNode seasonsNode = t.get("seasons");
                if (teamNode == null || seasonsNode == null) continue;

                boolean hasYear = false;
                for (JsonNode season : seasonsNode) {
                    if (season.asInt() == year) {
                        hasYear = true;
                        break;
                    }
                }

                if (hasYear && nationality != null && !teamNode.get("name").asText("").contains(nationality)) {
                    teamName = teamNode.get("name").asText();
                    teamId = teamNode.get("id").asLong();
                    foundInYear = true;
                    break;
                }
            }
            if (foundInYear) break;
        }

        if (teamId == null) {
            return new TeamLeagueInfo(teamName, null);
        }

        String leaguesJson;
        try {
            leaguesJson = getLeaguesByTeam(teamId);
        } catch (Exception e) {
            return new TeamLeagueInfo(teamName, null);
        }

        JsonNode leaguesResponse;
        try {
            leaguesResponse = objectMapper.readTree(leaguesJson).get("response");
        } catch (Exception e) {
            return new TeamLeagueInfo(teamName, null);
        }

        if (leaguesResponse == null || !leaguesResponse.isArray()) {
            return new TeamLeagueInfo(teamName, null);
        }

        String leagueName = null;
        long maxDuration = -1;

        for (JsonNode l : leaguesResponse) {
            JsonNode league = l.get("league");
            if (league == null || !"League".equals(league.path("type").asText())) continue;

            JsonNode country = l.get("country");
            if (country != null && "World".equals(country.path("name").asText())) continue;

            for (JsonNode s : l.get("seasons")) {
                int seasonYear = s.get("year").asInt();
                if (seasonYear == currentYear || seasonYear == currentYear - 1) {
                    LocalDate start = parseExternalDate(s.get("start").asText());
                    LocalDate end = parseExternalDate(s.get("end").asText());
                    if (start != null && end != null) {
                        long duration = ChronoUnit.DAYS.between(start, end);
                        if (duration > maxDuration) {
                            maxDuration = duration;
                            leagueName = league.get("name").asText();
                        }
                    }
                }
            }
        }

        return new TeamLeagueInfo(teamName, leagueName);
    }

    @SuppressWarnings("unused")
    public TeamLeagueInfo resolveTeamAndLeagueFallback(Long playerId, String nationality, Throwable throwable) {
        System.err.println("API-Football is down or unavailable for team/league resolution: " + throwable.getMessage());
        return new TeamLeagueInfo(null, null);
    }

    private String getPlayerTeams(Long playerId) {
        String url = "https://v3.football.api-sports.io/players/teams";
        URI requestUri = UriComponentsBuilder.fromUriString(url)
                .queryParam("player", playerId)
                .build().encode().toUri();

        HttpHeaders headers = new HttpHeaders();
        headers.set("x-apisports-key", apiKey);
        headers.set("x-rapidapi-host", "v3.football.api-sports.io");

        HttpEntity<?> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    requestUri, HttpMethod.GET, entity, String.class);
            return response.getBody();
        } catch (Exception e) {
            throw new ServiceUnavailableException("Failed to fetch player teams from external API", e);
        }
    }

    private String getLeaguesByTeam(Long teamId) {
        String url = "https://v3.football.api-sports.io/leagues";
        URI requestUri = UriComponentsBuilder.fromUriString(url)
                .queryParam("team", teamId)
                .build().encode().toUri();

        HttpHeaders headers = new HttpHeaders();
        headers.set("x-apisports-key", apiKey);
        headers.set("x-rapidapi-host", "v3.football.api-sports.io");

        HttpEntity<?> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    requestUri, HttpMethod.GET, entity, String.class);
            return response.getBody();
        } catch (Exception e) {
            throw new ServiceUnavailableException("Failed to fetch team leagues from external API", e);
        }
    }

    private LocalDate parseExternalDate(String dateStr) {
        if (dateStr == null || dateStr.isEmpty()) return null;
        try {
            return LocalDate.parse(dateStr, DateTimeFormatter.ISO_LOCAL_DATE);
        } catch (Exception e) {
            return null;
        }
    }
}
