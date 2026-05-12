package draftkings.eureka.client.review;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class Application {

	public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
		// Solo para probar, borra esto después
		System.out.println("DEBUG - DB Pass Length: " + System.getenv("DB_SQL_PASS_DEV").length());
	}

}
