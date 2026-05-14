package draftkings.eureka.client.review;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
// Aunque este microservicio no va a llamar a otros (solo bd), según el profesor
// me dijo en clase, esto mejora un poco el balanceo de este micorservicio.
@EnableFeignClients
@EnableDiscoveryClient
public class Application {

	public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
	}

}
