package draftkings.eureka.client.user.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
                http
                                // 1. ACTIVA el soporte de CORS de Spring Security.
                                // Esto le dice que busque la configuración que definiste en el YAML
                                // (spring.mvc.cors)
                                .cors(Customizer.withDefaults())
                                .csrf(csrf -> csrf.disable())
                                .authorizeHttpRequests(auth -> auth
                                                // 2. Deja el permitAll para OPTIONS por seguridad extra
                                                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                                                // 3. Tu endpoint de sincronización DEBE estar expuesto aquí si se llama
                                                // antes de estar autenticado
                                                .requestMatchers("/api/auth/**", "/api/public/**").permitAll()
                                                .anyRequest().authenticated())
                                .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()));

                return http.build();
        }
}
