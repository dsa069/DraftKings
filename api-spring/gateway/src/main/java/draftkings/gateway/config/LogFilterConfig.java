package draftkings.gateway.config;
/*
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import reactor.core.publisher.Mono;

@Configuration
public class LogFilterConfig {

    private static final Logger log = LoggerFactory.getLogger(LogFilterConfig.class);

    @Bean
    @Order(-1) // Ejecutar al principio de todo
    public GlobalFilter postFilter() {
        return (exchange, chain) -> {
            // 1. Ver qué envía Ionic al Gateway
            String authHeaderEntrante = exchange.getRequest().getHeaders().getFirst("Authorization");
            log.info("[GATEWAY ENTRANTE] Ruta: {} | Authorization: {}",
                    exchange.getRequest().getPath(),
                    (authHeaderEntrante != null ? "SÍ CONTIENE TOKEN" : "VACÍO (NULL)"));

            return chain.filter(exchange).then(Mono.fromRunnable(() -> {
                // 2. Ver el código de respuesta devuelto
                log.info("[GATEWAY SALIDA] Ruta: {} | Status Code: {}",
                        exchange.getRequest().getPath(),
                        exchange.getResponse().getStatusCode());
            }));
        };
    }
}*/