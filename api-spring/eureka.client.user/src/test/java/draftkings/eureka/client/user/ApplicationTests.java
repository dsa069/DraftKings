package draftkings.eureka.client.user;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertTrue;

@ActiveProfiles("test")
@SpringBootTest
class ApplicationTests {

	@Test
	void contextLoads() {
		assertTrue(true, "User context debe cargar correctamente");
	}

	@Test
	void userApplicationLoads() {
		assertTrue(true, "La aplicación User debe iniciarse sin errores");
	}

}
