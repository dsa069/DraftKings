package draftkings.eureka.client.review.controller;

import draftkings.eureka.client.review.domain.Review;
import draftkings.eureka.client.review.repository.ReviewRepository;
import draftkings.eureka.client.review.exception.BadRequestException;
import draftkings.eureka.client.review.exception.ResourceNotFoundException;
import draftkings.eureka.client.review.exception.InternalServerErrorException;
import draftkings.eureka.client.review.exception.CustomResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;

import java.util.List;

@RestController
@Tag(name = "Reviews", description = "Operaciones CRUD completas para la gestión de comentarios y reseñas de jugadores")
public class ReviewController {

    private final ReviewRepository reviewRepository;

    public ReviewController(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    // 10) Obtener comentarios de un jugador
    @GetMapping(value = "/api/players/{player_id}/reviews", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Obtener comentarios de un jugador", description = "Devuelve todas las reseñas filtradas por el identificador del jugador.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de reseñas encontradas", content = @Content(array = @ArraySchema(schema = @Schema(implementation = Review.class)))),
            @ApiResponse(responseCode = "400", description = "Identificador de jugador inválido", content = @Content(schema = @Schema(implementation = CustomResponse.class), examples = @ExampleObject(value = "{\"timestamp\":\"2026-05-28T23:57:00Z\",\"status\":400,\"error\":\"Player id must be greater than zero\",\"path\":\"/api/players/1/reviews\"}"))),
            @ApiResponse(responseCode = "404", description = "No se encontraron reseñas para el jugador", content = @Content(schema = @Schema(implementation = CustomResponse.class), examples = @ExampleObject(value = "{\"timestamp\":\"2026-05-28T23:57:00Z\",\"status\":404,\"error\":\"No reviews found for player: 1\",\"path\":\"/api/players/1/reviews\"}"))),
            @ApiResponse(responseCode = "500", description = "Error interno inesperado", content = @Content(schema = @Schema(implementation = CustomResponse.class), examples = @ExampleObject(value = "{\"timestamp\":\"2026-05-28T23:57:00Z\",\"status\":500,\"error\":\"Error loading reviews\",\"path\":\"/api/players/1/reviews\"}")))
    })
    public ResponseEntity<List<Review>> getReviewsByPlayer(
            @Parameter(description = "ID del jugador de la cual se quieren obtener las reseñas", required = true) @PathVariable("player_id") Long playerId) {
        if (playerId == null || playerId <= 0) {
            throw new BadRequestException("Player id must be greater than zero");
        }
        try {
            List<Review> reviews = reviewRepository.findByPlayerId(playerId);
            if (reviews == null || reviews.isEmpty()) {
                throw new ResourceNotFoundException(HttpStatus.NOT_FOUND, "No reviews found for player: " + playerId);
            }
            return ResponseEntity.ok(reviews);
        } catch (ResourceNotFoundException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new InternalServerErrorException("Error loading reviews", ex);
        }
    }

    // 11) Crear un comentario para un jugador
    @PostMapping(value = "/api/players/{player_id}/reviews", produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Crear un comentario para un jugador", description = "Añade una reseña con texto, puntuación y ubicación geográfica actual.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Comentario añadido con éxito", content = @Content(schema = @Schema(implementation = Review.class))),
            @ApiResponse(responseCode = "400", description = "Cuerpo de la petición inválido o faltan campos obligatorios", content = @Content(schema = @Schema(implementation = CustomResponse.class), examples = @ExampleObject(value = "{\"timestamp\":\"2026-05-28T23:57:00Z\",\"status\":400,\"error\":\"Review text and rating are required\",\"path\":\"/api/players/1/reviews\"}")))
    })
    public ResponseEntity<Review> createReview(
            @Parameter(description = "ID del jugador a asociar la reseña", required = true) @PathVariable("player_id") Long playerId,
            @RequestBody Review review) {

        if (review == null || review.getText() == null || review.getText().isBlank() || review.getRating() == null) {
            throw new BadRequestException("Review text and rating are required");
        }

        review.setPlayerId(playerId);

        if (review.getUserId() == null) {
            review.setUserId(1L);
        }

        try {
            Review savedReview = reviewRepository.save(review);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedReview);
        } catch (Exception ex) {
            throw new InternalServerErrorException("Error creating review", ex);
        }
    }

    // 12) Editar comentario
    @PutMapping(value = "/api/reviews/{id}", produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Editar comentario", description = "Edita el texto y/o la puntuación de una reseña existente.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Comentario actualizado con éxito", content = @Content(schema = @Schema(implementation = Review.class))),
            @ApiResponse(responseCode = "400", description = "Cuerpo de la petición inválido", content = @Content(schema = @Schema(implementation = CustomResponse.class), examples = @ExampleObject(value = "{\"timestamp\":\"2026-05-28T23:57:00Z\",\"status\":400,\"error\":\"At least text or rating must be provided\",\"path\":\"/api/reviews/1\"}"))),
            @ApiResponse(responseCode = "404", description = "La reseña con el ID proporcionado no existe", content = @Content(schema = @Schema(implementation = CustomResponse.class), examples = @ExampleObject(value = "{\"timestamp\":\"2026-05-28T23:57:00Z\",\"status\":404,\"error\":\"Review not found with ID: 999\",\"path\":\"/api/reviews/999\"}")))
    })
    public ResponseEntity<Review> updateReview(
            @Parameter(description = "ID de la reseña a modificar", required = true) @PathVariable("id") Long id,
            @RequestBody Review reviewDetails) {

        if (reviewDetails == null || (reviewDetails.getText() == null && reviewDetails.getRating() == null)) {
            throw new BadRequestException("At least text or rating must be provided");
        }

        Review existingReview;
        try {
            existingReview = reviewRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException(HttpStatus.NOT_FOUND,
                            "Review not found with ID: " + id));
        } catch (ResourceNotFoundException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new InternalServerErrorException("Error loading review", ex);
        }

        if (reviewDetails.getText() != null)
            existingReview.setText(reviewDetails.getText());
        if (reviewDetails.getRating() != null)
            existingReview.setRating(reviewDetails.getRating());

        try {
            Review updatedReview = reviewRepository.save(existingReview);
            return ResponseEntity.ok(updatedReview);
        } catch (Exception ex) {
            throw new InternalServerErrorException("Error updating review", ex);
        }
    }

    // 13) Eliminar comentario
    @DeleteMapping(value = "/api/reviews/{id}")
    @Operation(summary = "Eliminar comentario", description = "Elimina de forma lógica/física una reseña por moderación. Exclusivo para administradores.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Comentario eliminado correctamente (Sin Contenido)"),
            @ApiResponse(responseCode = "404", description = "El comentario no existe", content = @Content(schema = @Schema(implementation = CustomResponse.class), examples = @ExampleObject(value = "{\"timestamp\":\"2026-05-28T23:57:00Z\",\"status\":404,\"error\":\"Review cannot be deleted. ID not found: 999\",\"path\":\"/api/reviews/999\"}")))
    })
    public ResponseEntity<Void> deleteReview(
            @Parameter(description = "ID de la reseña a eliminar", required = true) @PathVariable("id") Long id) {

        try {
            if (!reviewRepository.existsById(id)) {
                throw new ResourceNotFoundException(HttpStatus.NOT_FOUND,
                        "Review cannot be deleted. ID not found: " + id);
            }

            reviewRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (ResourceNotFoundException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new InternalServerErrorException("Error deleting review", ex);
        }
    }
}
