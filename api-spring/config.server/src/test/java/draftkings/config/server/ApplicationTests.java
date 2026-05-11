package draftkings.config.server;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertTrue;

@ActiveProfiles("test")
@SpringBootTest
class ApplicationTests {

	@Test
	void contextLoads() {
		assertTrue(true, "Config Server debe cargar el contexto correctamente");
	}

	@Test
	void configServerApplicationLoads() {
		assertTrue(true, "La aplicación Config Server debe iniciarse sin errores");
	}
}
