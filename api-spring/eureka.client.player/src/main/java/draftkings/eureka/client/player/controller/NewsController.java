package draftkings.eureka.client.player.controller;

import draftkings.eureka.client.player.dto.NewsDTO;
import draftkings.eureka.client.player.exception.BadRequestException;
import draftkings.eureka.client.player.exception.CustomResponse;
import draftkings.eureka.client.player.service.NewsService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/news")
@Tag(name = "News", description = "Operaciones de noticias integradas con sistema CORBA")
public class NewsController {

    private final NewsService newsService;

    public NewsController(NewsService newsService) {
        this.newsService = newsService;
    }

    // 14) Obtener noticias de jugadores
    @GetMapping
    @Operation(summary = "Obtener noticias de jugadores", description = "Recupera la lista de noticias desde el sistema externo CORBA.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de noticias obtenida correctamente", content = @Content(array = @ArraySchema(schema = @Schema(implementation = NewsDTO.class)))),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor", content = @Content(schema = @Schema(implementation = CustomResponse.class), examples = @ExampleObject(value = "{\"timestamp\":\"2026-04-10T12:00:00Z\",\"status\":500,\"error\":\"Error al comunicarse con el sistema de noticias\",\"path\":\"/api/news\"}"))),
            @ApiResponse(responseCode = "503", description = "El sistema externo de noticias (CORBA) no está disponible", content = @Content(schema = @Schema(implementation = CustomResponse.class), examples = @ExampleObject(value = "{\"timestamp\":\"2026-04-10T12:00:00Z\",\"status\":503,\"error\":\"El sistema externo de noticias (CORBA) no está disponible\",\"path\":\"/api/news\"}")))
    })
    public ResponseEntity<List<NewsDTO>> getAllNews() {
        List<NewsDTO> news = newsService.getAllNews();
        return ResponseEntity.ok(news);
    }

    // 15) Ver noticia en detalle
    @GetMapping("/{id}")
    @Operation(summary = "Ver noticia en detalle", description = "Obtiene los detalles de una noticia específica por su ID.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Noticia encontrada", content = @Content(schema = @Schema(implementation = NewsDTO.class))),
            @ApiResponse(responseCode = "400", description = "ID inválido", content = @Content(schema = @Schema(implementation = CustomResponse.class), examples = @ExampleObject(value = "{\"timestamp\":\"2026-04-10T12:00:00Z\",\"status\":400,\"error\":\"El ID de la noticia debe ser válido\",\"path\":\"/api/news/1\"}"))),
            @ApiResponse(responseCode = "404", description = "La noticia no existe", content = @Content(schema = @Schema(implementation = CustomResponse.class), examples = @ExampleObject(value = "{\"timestamp\":\"2026-04-10T12:00:00Z\",\"status\":404,\"error\":\"Noticia no encontrada: 1\",\"path\":\"/api/news/1\"}"))),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor", content = @Content(schema = @Schema(implementation = CustomResponse.class), examples = @ExampleObject(value = "{\"timestamp\":\"2026-04-10T12:00:00Z\",\"status\":500,\"error\":\"Error al comunicarse con el sistema de noticias\",\"path\":\"/api/news/1\"}"))),
            @ApiResponse(responseCode = "503", description = "El sistema externo de noticias (CORBA) no está disponible", content = @Content(schema = @Schema(implementation = CustomResponse.class), examples = @ExampleObject(value = "{\"timestamp\":\"2026-04-10T12:00:00Z\",\"status\":503,\"error\":\"El sistema externo de noticias (CORBA) no está disponible\",\"path\":\"/api/news\"}")))
    })
    public ResponseEntity<NewsDTO> getNewsById(@PathVariable Long id) {
        if (id == null || id < 0) {
            throw new BadRequestException("El ID de la noticia debe ser válido");
        }
        NewsDTO newsDetail = newsService.getNewsById(id);
        return ResponseEntity.ok(newsDetail);
    }

    // 16) Publicar una noticia
    @PostMapping
    @Operation(summary = "Publicar una noticia", description = "Crea una nueva noticia en el sistema CORBA. Exclusivo de Administrador.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Noticia publicada correctamente", content = @Content(schema = @Schema(implementation = NewsDTO.class))),
            @ApiResponse(responseCode = "400", description = "Body inválido", content = @Content(schema = @Schema(implementation = CustomResponse.class), examples = @ExampleObject(value = "{\"timestamp\":\"2026-04-10T12:00:00Z\",\"status\":400,\"error\":\"El body de la noticia es inválido o está incompleto\",\"path\":\"/api/news\"}"))),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor", content = @Content(schema = @Schema(implementation = CustomResponse.class), examples = @ExampleObject(value = "{\"timestamp\":\"2026-04-10T12:00:00Z\",\"status\":500,\"error\":\"Error publicando la noticia en el sistema externo\",\"path\":\"/api/news\"}"))),
            @ApiResponse(responseCode = "503", description = "El sistema externo de noticias (CORBA) no está disponible", content = @Content(schema = @Schema(implementation = CustomResponse.class), examples = @ExampleObject(value = "{\"timestamp\":\"2026-04-10T12:00:00Z\",\"status\":503,\"error\":\"El sistema externo de noticias (CORBA) no está disponible\",\"path\":\"/api/news\"}")))
    })
    public ResponseEntity<NewsDTO> createNews(@RequestBody NewsDTO newsDTO) {
        if (newsDTO == null) {
            // Alineado con el mensaje exacto esperado por el API response
            throw new BadRequestException("El body de la noticia es inválido o está incompleto");
        }

        NewsDTO createdNews = newsService.createNews(newsDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdNews);
    }
}