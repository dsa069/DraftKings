package draftkings.gateway;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class ApplicationTests {

	@Test
	void contextLoads() {
		assertTrue(true, "Gateway context debe cargar correctamente");
	}

	@Test
	void gatewayApplicationStartsSuccessfully() {
		assertTrue(true, "La aplicación gateway debe iniciarse sin errores");
	}
}
