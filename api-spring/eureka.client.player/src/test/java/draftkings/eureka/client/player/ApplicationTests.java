package draftkings.eureka.client.player;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertTrue;

@ActiveProfiles("test")
@SpringBootTest
class ApplicationTests {

	@Test
	void contextLoads() {
		assertTrue(true, "Player context debe cargar correctamente");
	}

	@Test
	void playerApplicationLoads() {
		assertTrue(true, "La aplicación Player debe iniciarse sin errores");
	}

}
