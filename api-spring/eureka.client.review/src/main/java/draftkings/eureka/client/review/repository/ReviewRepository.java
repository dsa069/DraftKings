package draftkings.eureka.client.review.repository;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import draftkings.eureka.client.review.domain.Review;

@Repository
public interface ReviewRepository extends CrudRepository<Review, Long> {
    // Métodos de búsqueda personalizados
    java.util.List<Review> findByUserId(Long userId);

    java.util.List<Review> findByPlayerId(Long playerId);
}
