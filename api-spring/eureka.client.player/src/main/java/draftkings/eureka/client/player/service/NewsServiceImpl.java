package draftkings.eureka.client.player.service;

import draftkings.eureka.client.player.dto.NewsDTO;
import draftkings.eureka.client.player.exception.BadRequestException;
import draftkings.eureka.client.player.exception.InternalServerErrorException;
import draftkings.eureka.client.player.exception.ResourceNotFoundException;
import draftkings.eureka.client.player.exception.ServiceUnavailableException;

import io.github.resilience4j.circuitbreaker.CallNotPermittedException;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NewsServiceImpl implements NewsService {

    private final String corbaNewsUrl;
    private final RestTemplate restTemplate;

    public NewsServiceImpl(@Value("${api.news.url}") String corbaNewsUrl) {
        this.corbaNewsUrl = corbaNewsUrl;
        // Instanciamos RestTemplate para la comunicación con el Servlet
        this.restTemplate = new RestTemplate();
    }

    @Override
    @CircuitBreaker(name = "corbaNews", fallbackMethod = "getAllNewsFallback")
    public List<NewsDTO> getAllNews() {
        // CORBA espera "Obtener todas" como query param para GET
        String url = corbaNewsUrl + "?action=Obtener+todas&format=json";

        try {
            CorbaListResponse response = restTemplate.getForObject(url, CorbaListResponse.class);

            // Manejamos la respuesta de error de CORBA (ej. buffer vacío)
            if (response != null && !response.ok()) {
                if ("El buffer esta vacio.".equals(response.error())) {
                    return Collections.emptyList();
                }
                throw new InternalServerErrorException("Error del sistema CORBA: " + response.error(), null);
            }

            // Mapeamos el JSON al DTO si todo es correcto
            if (response != null && response.noticias() != null) {
                return response.noticias().stream()
                        .map(this::mapToDTO)
                        .collect(Collectors.toList());
            }

            return Collections.emptyList();
        } catch (RestClientException e) {
            throw new InternalServerErrorException("Error de conexión al obtener noticias", e);
        }
    }

    public List<NewsDTO> getAllNewsFallback(Throwable t) {
        if (t instanceof CallNotPermittedException) {
            throw new ServiceUnavailableException("El sistema externo de noticias (CORBA) no está disponible", t);
        }
        throw new InternalServerErrorException("Error al comunicarse con el sistema de noticias", t);
    }

    @Override
    @CircuitBreaker(name = "corbaNews", fallbackMethod = "getNewsByIdFallback")
    public NewsDTO getNewsById(Long id) {
        if (id == null || id < 0) {
            throw new BadRequestException("El ID de la noticia debe ser válido");
        }

        HttpHeaders headers = createFormHeaders();
        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("action", "Leer en");
        map.add("indice", id.toString());

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);

        try {
            CorbaSingleResponse response = restTemplate.postForObject(corbaNewsUrl, request, CorbaSingleResponse.class);

            if (response != null && !response.ok()) {
                throw new ResourceNotFoundException(HttpStatus.NOT_FOUND,
                        "Noticia no encontrada: " + id + " (" + response.error() + ")");
            }

            if (response != null && response.noticia() != null) {
                return mapToDTO(response.noticia());
            }

            throw new InternalServerErrorException("Respuesta inválida del servidor CORBA", null);
        } catch (RestClientException e) {
            throw new InternalServerErrorException("Error de conexión al obtener la noticia", e);
        }
    }

    public NewsDTO getNewsByIdFallback(Long id, Throwable t) {
        if (t instanceof BadRequestException || t instanceof ResourceNotFoundException) {
            throw (RuntimeException) t;
        }
        if (t instanceof CallNotPermittedException) {
            throw new ServiceUnavailableException("El sistema externo de noticias (CORBA) no está disponible", t);
        }
        throw new InternalServerErrorException("Error al comunicarse con el sistema de noticias", t);
    }

    @Override
    @CircuitBreaker(name = "corbaNews", fallbackMethod = "createNewsFallback")
    public NewsDTO createNews(NewsDTO newsDTO) {
        if (newsDTO == null || newsDTO.getTitulo() == null || newsDTO.getTitulo().isBlank()) {
            throw new BadRequestException("El body de la noticia es inválido o está incompleto");
        }

        HttpHeaders headers = createFormHeaders();
        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("action", "Enviar");
        if (newsDTO.getFecha() != null)
            map.add("fecha", newsDTO.getFecha());
        if (newsDTO.getJugador() != null)
            map.add("jugador", newsDTO.getJugador());
        if (newsDTO.getInteres() != null)
            map.add("interes", newsDTO.getInteres());
        map.add("titulo", newsDTO.getTitulo());
        if (newsDTO.getDescripcion() != null)
            map.add("descripcion", newsDTO.getDescripcion());

        // Las etiquetas pueden unirse si vienen en lista
        if (newsDTO.getEtiquetas() != null && !newsDTO.getEtiquetas().isEmpty()) {
            map.add("etiquetas", String.join(", ", newsDTO.getEtiquetas()));
        }

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);

        try {
            CorbaPostResponse response = restTemplate.postForObject(corbaNewsUrl, request, CorbaPostResponse.class);

            if (response != null && !response.ok()) {
                // Captura validaciones de CORBA (ej. longitud de la descripción)
                throw new BadRequestException(response.error());
            }

            return newsDTO;
        } catch (RestClientException e) {
            throw new InternalServerErrorException("Error publicando la noticia en el sistema externo", e);
        }
    }

    public NewsDTO createNewsFallback(NewsDTO newsDTO, Throwable t) {
        if (t instanceof BadRequestException) {
            throw (RuntimeException) t;
        }
        if (t instanceof CallNotPermittedException) {
            throw new ServiceUnavailableException("El sistema externo de noticias (CORBA) no está disponible", t);
        }
        throw new InternalServerErrorException("Error publicando la noticia en el sistema externo", t);
    }

    // --- MÉTODOS DE AYUDA Y MAPEADORES ---

    private HttpHeaders createFormHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
        return headers;
    }

    private NewsDTO mapToDTO(CorbaNews corbaNews) {
        NewsDTO dto = new NewsDTO();
        dto.setId(corbaNews.indice());
        dto.setFecha(corbaNews.fecha());
        dto.setJugador(corbaNews.jugador());
        dto.setInteres(corbaNews.interes());
        dto.setTitulo(corbaNews.titulo());
        dto.setDescripcion(corbaNews.descripcion());
        dto.setEtiquetas(corbaNews.etiquetas());
        return dto;
    }

    // --- RECORDS INTERNOS PARA MAPEAR LAS RESPUESTAS JSON DE CORBA ---

    private record CorbaNews(Long indice, String fecha, String jugador, String interes, String titulo,
            String descripcion, List<String> etiquetas) {
    }

    private record CorbaListResponse(boolean ok, String error, String action, Integer count, List<CorbaNews> noticias) {
    }

    private record CorbaSingleResponse(boolean ok, String error, String action, Integer indice, CorbaNews noticia) {
    }

    private record CorbaPostResponse(boolean ok, String error, String action, String message) {
    }
}