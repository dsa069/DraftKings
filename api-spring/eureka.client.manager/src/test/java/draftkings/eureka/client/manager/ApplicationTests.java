package draftkings.eureka.client.manager;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class ApplicationTests {

	@Test
	void contextLoads() {
		assertTrue(true, "Manager context debe cargar correctamente");
	}

	@Test
	void managerApplicationLoads() {
		assertTrue(true, "La aplicación Manager debe iniciarse sin errores");
	}

}
