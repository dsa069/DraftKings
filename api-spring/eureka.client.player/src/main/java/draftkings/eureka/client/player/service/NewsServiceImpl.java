package draftkings.eureka.client.player.service;

import draftkings.eureka.client.player.dto.NewsDTO;
import draftkings.eureka.client.player.exception.BadRequestException;
import draftkings.eureka.client.player.exception.InternalServerErrorException;
import draftkings.eureka.client.player.exception.ResourceNotFoundException;
import draftkings.eureka.client.player.exception.ServiceUnavailableException;

import io.github.resilience4j.circuitbreaker.CallNotPermittedException;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NewsServiceImpl implements NewsService {

    private final String corbaNewsUrl;

    public NewsServiceImpl(@Value("${api.news.url}") String corbaNewsUrl) {
        this.corbaNewsUrl = corbaNewsUrl;
    }

    @Override
    @CircuitBreaker(name = "corbaNews", fallbackMethod = "getAllNewsFallback")
    public List<NewsDTO> getAllNews() {
        // TODO: Implementar la conexión al sistema CORBA
        return List.of();
    }

    // Fallback para getAllNews
    public List<NewsDTO> getAllNewsFallback(Throwable t) {
        // Si el Circuit Breaker está abierto, devolvemos 503
        if (t instanceof CallNotPermittedException) {
            throw new ServiceUnavailableException("El sistema externo de noticias (CORBA) no está disponible", t);
        }
        // Para cualquier otro fallo inesperado de comunicación en el flujo: 500 según
        // Swagger
        throw new InternalServerErrorException("Error al comunicarse con el sistema de noticias", t);
    }

    @Override
    @CircuitBreaker(name = "corbaNews", fallbackMethod = "getNewsByIdFallback")
    public NewsDTO getNewsById(Long id) {
        if (id == null || id < 0) {
            throw new BadRequestException("El ID de la noticia debe ser válido");
        }

        // TODO: Lógica para buscar por ID en CORBA
        NewsDTO news = null; // Simulación del resultado de CORBA

        // Si el sistema externo responde pero la noticia no existe -> 404
        if (news == null) {
            throw new ResourceNotFoundException(HttpStatus.NOT_FOUND, "Noticia no encontrada: " + id);
        }

        return news;
    }

    // Fallback para getNewsById
    public NewsDTO getNewsByIdFallback(Long id, Throwable t) {
        // Si el error fue de validación (400) o no encontrado (404), lo relanzamos
        // directamente
        if (t instanceof BadRequestException || t instanceof ResourceNotFoundException) {
            throw (RuntimeException) t;
        }
        // Si el Circuit Breaker está abierto: 503
        if (t instanceof CallNotPermittedException) {
            throw new ServiceUnavailableException("El sistema externo de noticias (CORBA) no está disponible", t);
        }
        // Fallo técnico de comunicación genérico: 500
        throw new InternalServerErrorException("Error al comunicarse con el sistema de noticias", t);
    }

    @Override
    @CircuitBreaker(name = "corbaNews", fallbackMethod = "createNewsFallback")
    public NewsDTO createNews(NewsDTO newsDTO) {
        if (newsDTO == null || newsDTO.getTitulo() == null || newsDTO.getTitulo().isBlank()) {
            throw new BadRequestException("El body de la noticia es inválido o está incompleto");
        }
        // TODO: Lógica para enviar el objeto al sistema CORBA
        return newsDTO;
    }

    // Fallback para createNews
    public NewsDTO createNewsFallback(NewsDTO newsDTO, Throwable t) {
        if (t instanceof BadRequestException) {
            throw (RuntimeException) t;
        }
        if (t instanceof CallNotPermittedException) {
            throw new ServiceUnavailableException("El sistema externo de noticias (CORBA) no está disponible", t);
        }
        throw new InternalServerErrorException("Error publicando la noticia en el sistema externo", t);
    }
}