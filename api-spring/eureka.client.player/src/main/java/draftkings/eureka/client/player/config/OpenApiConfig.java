package draftkings.eureka.client.player.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;

@Configuration
public class OpenApiConfig {

        @Value("${openapi.title:Act06 JPA Microservice API}")
        private String title;

        @Value("${openapi.description:API description}")
        private String description;

        @Value("${openapi.version:1.0}")
        private String version;

        @Value("${openapi.contact.name:}")
        private String contactName;

        @Value("${openapi.contact.email:}")
        private String contactEmail;

        @Value("${openapi.contact.url:}")
        private String contactUrl;

        @Bean
        public OpenAPI customOpenAPI() {
                return new OpenAPI()
                                /*
                                 * .components(new Components().addSecuritySchemes("Bearer Authentication",
                                 * new
                                 * SecurityScheme().type(SecurityScheme.Type.HTTP).scheme("bearer").bearerFormat
                                 * ("JWT")
                                 * .description("Introduce el token JWT aquí.")))
                                 * .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
                                 */
                                .info(new Info().title(title).version(version).description(description)
                                                .contact(new Contact().name(contactName).email(contactEmail)
                                                                .url(contactUrl)));
        }
}
