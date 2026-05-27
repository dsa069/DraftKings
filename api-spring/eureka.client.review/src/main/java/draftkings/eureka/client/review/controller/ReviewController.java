package draftkings.eureka.client.review.controller;

import draftkings.eureka.client.review.domain.Review;
import draftkings.eureka.client.review.repository.ReviewRepository;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@RestController
public class ReviewController {

    private final ReviewRepository reviewRepository;

    public ReviewController(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    // 10) Obtener comentarios de un jugador
    @GetMapping("/api/players/{player_id}/reviews")
    public ResponseEntity<List<Review>> getReviewsByPlayer(@PathVariable("player_id") Long playerId) {
        List<Review> reviews = reviewRepository.findByPlayerId(playerId);
        return ResponseEntity.ok(reviews);
    }

    // 11) Crear un comentario para un jugador
    @PostMapping("/api/players/{player_id}/reviews")
    public ResponseEntity<Review> createReview(@PathVariable("player_id") Long playerId, @RequestBody Review review) {
        // Enlazamos el jugador a la review
        review.setPlayerId(playerId);

        // Manejamos la fecha
        if (review.getCreatedAt() == null) {
            review.setCreatedAt(new Date());
        }

        // NOTA IMPORTANTE: Tu entidad Review tiene un @NotNull en userId.
        // Como tu JSON de ejemplo no lo incluye, debes obtenerlo del token de
        // autenticación
        // o establecer un valor por defecto temporalmente para que no pete la BD.
        if (review.getUserId() == null) {
            review.setUserId(1L); // Cambiar por la extracción de ID del usuario autenticado
        }

        Review savedReview = reviewRepository.save(review);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedReview);
    }

    // 12) Editar comentario
    @PutMapping("/api/reviews/{id}")
    public ResponseEntity<Review> updateReview(@PathVariable("id") Long id, @RequestBody Review reviewDetails) {
        Optional<Review> existingReviewOpt = reviewRepository.findById(id);
        if (existingReviewOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Review existingReview = existingReviewOpt.get();

        // Actualización parcial (solo texto y rating según tu ejemplo)
        if (reviewDetails.getText() != null)
            existingReview.setText(reviewDetails.getText());
        if (reviewDetails.getRating() != null)
            existingReview.setRating(reviewDetails.getRating());

        Review updatedReview = reviewRepository.save(existingReview);
        return ResponseEntity.ok(updatedReview);
    }

    // 13) Eliminar comentario
    @DeleteMapping("/api/reviews/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable("id") Long id) {
        if (reviewRepository.existsById(id)) {
            reviewRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
