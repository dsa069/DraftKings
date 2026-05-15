package draftkings.eureka.client.user.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Deshabilitar CSRF para APIs REST
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/public/**").permitAll() // Rutas públicas si las tienes
                        .anyRequest().authenticated() // Requiere token para el resto
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> {
                        }) // Habilita la validación de JWT usando el application.yml
                );
        return http.build();
    }
}