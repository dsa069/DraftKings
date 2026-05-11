package draftkings.eureka.client.review.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class ReviewControllerTest {

    @Autowired
    private ReviewController reviewController;

    @Test
    void contextLoads() {
        assertNotNull(reviewController, "ReviewController debe ser inyectado correctamente");
    }

    @Test
    void reviewControllerExists() {
        assertTrue(reviewController != null, "El controlador de reseñas debe existir");
    }
}
