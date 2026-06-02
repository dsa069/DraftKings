package draftkings.eureka.client.review;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertTrue;

@ActiveProfiles("test")
@SpringBootTest
class ApplicationTests {

	@Test
	void contextLoads() {
		assertTrue(true, "Review context debe cargar correctamente");
	}

	@Test
	void reviewApplicationLoads() {
		assertTrue(true, "La aplicación Review debe iniciarse sin errores");
	}

}
