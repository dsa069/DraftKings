package draftkings.eureka.client.player.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@ActiveProfiles("test")
@SpringBootTest
class PlayerControllerTest {

    @Autowired
    private PlayerController playerController;

    @Test
    void contextLoads() {
        assertNotNull(playerController, "PlayerController debe ser inyectado correctamente");
    }

    @Test
    void checkPlayerEndpointExists() {
        assertTrue(playerController != null, "El controlador de jugadores debe existir");
    }
}
