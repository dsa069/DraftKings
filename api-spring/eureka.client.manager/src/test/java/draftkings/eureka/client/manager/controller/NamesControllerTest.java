package draftkings.eureka.client.manager.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
class NamesControllerTest {

    @Autowired
    private NamesController namesController;

    @Test
    void contextLoads() {
        assertNotNull(namesController, "NamesController debe ser inyectado correctamente");
    }

    @Test
    void namesControllerExists() {
        assertNotNull(namesController, "El controlador de nombres debe existir");
    }
}
