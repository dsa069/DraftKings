# Rúbrica de Evaluación — DraftKings API Spring

---

## 1. Las noticias se crean y se visualizan a través de un ORB implementado con CORBA

### Evaluación/Justificación

El proyecto implementa un sistema completo de noticias basado en CORBA con la siguiente arquitectura:

1. **Definición IDL**: El archivo `Buffer.idl` define la interfaz CORBA `Buffer` dentro del módulo `BufferApp` con 5 operaciones: `num_elementos()`, `put()`, `obtener_todas()`, `read_en()` y `shutdown()`.

2. **Servidor CORBA**: `BufferServer.java` inicializa el ORB, crea la implementación `BufferImpl`, lo conecta al ORB y lo registra en el NameService de CORBA via CosNaming.

3. **Servlet Puente**: `ServletImpl.java` actúa como adaptador entre HTTP y CORBA. Recibe peticiones HTTP, del microservicio Spring y el backend Node, donde las traduce a llamadas CORBA al Buffer.

4. **Integración Spring**: `NewsServiceImpl.java` en el microservicio `playerMS` se comunica con el Servlet via HTTP/RestTemplate, con circuit breaker Resilience4j para tolerancia a fallos.

5. **Controller REST**: `NewsController.java` expone los endpoints `/api/news` (GET, GET/{id}, POST) que son consumidos por el frontend.

La cadena completa es: Frontend → Gateway → Spring Controller → NewsServiceImpl → RestTemplate → ServletImpl (HTTP) → ORB Cliente → ORB Servidor → BufferImpl.

### Fragmentos de Código (Evidencias)

**IDL - Definición de la interfaz CORBA:**
```idl
module BufferApp {
    typedef sequence<string> ListaNoticias;
    interface Buffer {
       long num_elementos();
       boolean put(in string elemento);
       ListaNoticias obtener_todas();
       boolean read_en(in long indice, out string elemento);
       oneway void shutdown();
    };
};
```

**Servidor CORBA - Inicialización del ORB:**
```java
ORB orb = ORB.init(args, null);
BufferImpl bufferRef = new BufferImpl();
orb.connect(bufferRef);
org.omg.CORBA.Object objRef = orb.resolve_initial_references("NameService");
NamingContextExt ncRef = NamingContextExtHelper.narrow(objRef);
ncRef.rebind(path, bufferRef);
```

**Servlet Puente - Conexión ORB cliente:**
```java
String args[] = {"-ORBInitialPort", orbPort, "-ORBInitialHost", orbHost};
ORB orb = ORB.init(args, props);
org.omg.CORBA.Object objRef = orb.resolve_initial_references("NameService");
NamingContextExt ncRef = NamingContextExtHelper.narrow(objRef);
bufferImpl = BufferHelper.narrow(ncRef.resolve_str(bufferName));
```

**NewsServiceImpl - Integración con Spring:**
```java
@CircuitBreaker(name = "corbaNews", fallbackMethod = "getAllNewsFallback")
public List<NewsDTO> getAllNews() {
    String requestUri = newsApiUrl + "?action=Obtener+todas&format=json";
    ResponseEntity<String> response = restTemplate.exchange(requestUri, HttpMethod.GET, entity, String.class);
    CorbaListResponse listResponse = objectMapper.readValue(response.getBody(), CorbaListResponse.class);
    return listResponse.noticias().stream().map(n -> new NewsDTO(...)).toList();
}
```

### Referencias

- **IDL**: `corba-services/DK_News_Manager/Buffer.idl`
- **Servidor CORBA**: `corba-services/DK_News_Manager/src/Server/BufferServer.java`
- **Implementación Buffer**: `corba-services/DK_News_Manager/src/Server/BufferImpl.java`
- **Servlet Puente**: `corba-services/DK_News_Prod_Cons/src/ual/dss/servlet/ServletImpl.java`
- **NewsServiceImpl**: `eureka.client.player/src/main/java/draftkings/eureka/client/player/service/NewsServiceImpl.java`
- **NewsController**: `eureka.client.player/src/main/java/draftkings/eureka/client/player/controller/NewsController.java`

---

## 2. Se utiliza Spring Data para la persistencia de los datos gestionados por los microservicios

### Evaluación/Justificación

El proyecto utiliza Spring Data JPA en los 3 microservicios que manejan persistencia (`playerMS`, `reviewMS`, `userMS`):

1. **Repositorios**: Todos extienden `CrudRepository` proporcionando operaciones CRUD automáticas (findById, save, saveAll, deleteById, existsById).

2. **Entidades JPA**: 3 entidades anotadas con `@Entity`:
   - `Player.java` (tabla `player`, 15 campos)
   - `Review.java` (tabla `review`, 9 campos)
   - `User.java` (tabla `users`, 5 campos)

3. **Consultas personalizadas**:
   - `@Query` JPQL en `PlayerRepository` con 4 filtros dinámicos y paginación
   - Métodos derivados de consulta: `findByFirebaseUid()` en `UserRepository`, `findByPlayerId()` en `ReviewRepository`

4. **Configuración**: PostgreSQL (Supabase en dev/prod, Docker en local), `ddl-auto: update`, `open-in-view: false`.

### Fragmentos de Código (Evidencias)

**PlayerRepository - Consulta @Query con filtros dinámicos:**
```java
@Repository
public interface PlayerRepository extends CrudRepository<Player, Long> {
    @Query("SELECT p FROM Player p WHERE " +
            "(CAST(:search AS string) IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))) AND " +
            "(CAST(:team AS string) IS NULL OR p.team = :team) AND " +
            "(CAST(:league AS string) IS NULL OR p.league = :league) AND " +
            "(CAST(:startDate AS timestamp) IS NULL OR p.createdAt >= :startDate)")
    Page<Player> findAllWithFilters(
            @Param("search") String search,
            @Param("team") String team,
            @Param("league") String league,
            @Param("startDate") Date startDate,
            Pageable pageable);
}
```

**UserRepository - Método derivado de consulta:**
```java
@Repository
public interface UserRepository extends CrudRepository<User, Long> {
    User findByFirebaseUid(String firebaseUid);
}
```

**ReviewRepository - Método derivado de consulta:**
```java
@Repository
public interface ReviewRepository extends CrudRepository<Review, Long> {
    java.util.List<Review> findByPlayerId(Long playerId);
}
```

**Entidad Player:**
```java
@Entity
@Table(name = "player")
public class Player {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotBlank @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String name;
    // ... 14 campos más
}
```

**Configuración de BD en application.yaml:**
```yaml
spring:
  datasource:
    url: jdbc:postgresql://postgresql/draftkings
    username: postgres
    password: postgres
  jpa:
    database-platform: org.hibernate.dialect.PostgreSQLDialect
    hibernate:
      ddl-auto: update
    open-in-view: false
```

### Referencias

- **PlayerRepository**: `eureka.client.player/src/main/java/draftkings/eureka/client/player/repository/PlayerRepository.java`
- **ReviewRepository**: `eureka.client.review/src/main/java/draftkings/eureka/client/review/repository/ReviewRepository.java`
- **UserRepository**: `eureka.client.user/src/main/java/draftkings/eureka/client/user/repository/UserRepository.java`
- **Player.java**: `eureka.client.player/src/main/java/draftkings/eureka/client/player/domain/Player.java`
- **Review.java**: `eureka.client.review/src/main/java/draftkings/eureka/client/review/domain/Review.java`
- **User.java**: `eureka.client.user/src/main/java/draftkings/eureka/client/user/domain/User.java`
- **Config playerMS**: `eureka.client.player/src/main/resources/application.yaml`

---

## 3. Se realiza una gestión de los códigos HTTP como resultado de la ejecución de las operaciones

### Evaluación/Justificación

El proyecto gestiona códigos HTTP de forma explícita y sistemática:

1. **ResponseEntity con códigos específicos**: Se utilizan códigos 200 (OK), 201 (CREATED) y 204 (NO CONTENT) en los controllers.

2. **Excepciones personalizadas mapeadas a códigos HTTP**:
   - `BadRequestException` → 400
   - `UnauthorizedException` → 401
   - `ForbiddenException` → 403
   - `ResourceNotFoundException` → 404
   - `ConflictException` → 409
   - `InternalServerErrorException` → 500
   - `ServiceUnavailableException` → 503

3. **Handler global**: `HandlerExceptionResolverImpl` mapea excepciones a códigos HTTP y genera respuestas JSON estandarizadas.

4. **DTO de error**: `CustomResponse` incluye el campo `status` con el código HTTP numérico.

### Fragmentos de Código (Evidencias)

**ResponseEntity con códigos HTTP específicos:**
```java
// 200 OK
return ResponseEntity.ok(players);

// 201 CREATED
return ResponseEntity.status(HttpStatus.CREATED).body(savedPlayer);

// 204 NO CONTENT
return ResponseEntity.noContent().build();
```

**Handler de excepciones - Mapeo exception → HTTP status:**
```java
@Override
public ModelAndView resolveException(HttpServletRequest request, HttpServletResponse response,
        Object handler, Exception ex) {
    if (ex instanceof BadRequestException || ex instanceof IllegalArgumentException) {
        return writeResponse(request, response, HttpStatus.BAD_REQUEST.value(), ...);     // 400
    }
    if (ex instanceof ResourceNotFoundException) {
        return writeResponse(request, response, HttpStatus.NOT_FOUND.value(), ...);       // 404
    }
    if (ex instanceof ServiceUnavailableException) {
        return writeResponse(request, response, HttpStatus.SERVICE_UNAVAILABLE.value(), ...); // 503
    }
    if (ex instanceof InternalServerErrorException || ex instanceof RuntimeException) {
        return writeResponse(request, response, HttpStatus.INTERNAL_SERVER_ERROR.value(), ...); // 500
    }
}
```

**DTO de respuesta de error con código HTTP:**
```java
@Schema(name = "ErrorResponse", description = "Standard error response")
public class CustomResponse {
    @Schema(description = "Timestamp of the error", example = "2026-04-10T12:00:00Z")
    private OffsetDateTime timestamp;
    @Schema(description = "HTTP status code", example = "404")
    private int status;
    @Schema(description = "Error message", example = "Player not found: 1")
    private String error;
    @Schema(description = "Request path", example = "/players/1")
    private String path;
}
```

**Lanzamiento de excepciones con código HTTP:**
```java
throw new ResourceNotFoundException(HttpStatus.NOT_FOUND, "Jugador no encontrado");
throw new BadRequestException("Player id must be greater than zero");
throw new ServiceUnavailableException("AI_SERVICE_ERROR", e);
throw new UnauthorizedException("Authentication token is required");
```

### Referencias

- **HandlerExceptionResolverImpl (player)**: `eureka.client.player/src/main/java/draftkings/eureka/client/player/exception/HandlerExceptionResolverImpl.java`
- **HandlerExceptionResolverImpl (review)**: `eureka.client.review/src/main/java/draftkings/eureka/client/review/exception/HandlerExceptionResolverImpl.java`
- **HandlerExceptionResolverImpl (user)**: `eureka.client.user/src/main/java/draftkings/eureka/client/user/exception/HandlerExceptionResolverImpl.java`
- **CustomResponse (player)**: `eureka.client.player/src/main/java/draftkings/eureka/client/player/exception/CustomResponse.java`
- **PlayerController**: `eureka.client.player/src/main/java/draftkings/eureka/client/player/controller/PlayerController.java`
- **ReviewController**: `eureka.client.review/src/main/java/draftkings/eureka/client/review/controller/ReviewController.java`

---

## 4. Se muestran los resultados de la ejecución de la funcionalidad implementada (resultado, mensaje y código HTTP)

### Evaluación/Justificación

El proyecto genera respuestas estructuradas que incluyen resultado, mensaje y código HTTP:

1. **DTO de respuesta de error estandarizado**: `CustomResponse` contiene `timestamp`, `status` (código HTTP), `error` (mensaje) y `path` (ruta solicitada).

2. **Respuestas JSON consistentes**: Todas las excepciones generan respuestas con la misma estructura JSON.

3. **Documentación Swagger**: Los controllers documentan los posibles códigos de respuesta con ejemplos JSON en las anotaciones `@ApiResponse`.

4. **Feign Fallback**: Cuando un microservicio falla, el fallback genera respuestas con código 503 y mensaje descriptivo.

### Fragmentos de Código (Evidencias)

**Estructura JSON de error generada:**
```json
{
  "timestamp": "2026-04-10T12:00:00Z",
  "status": 404,
  "error": "Jugador no encontrado: 1",
  "path": "/api/players/1"
}
```

**Documentación Swagger con códigos de respuesta:**
```java
@Operation(summary = "Obtener detalle de un jugador")
@ApiResponses(value = {
    @ApiResponse(responseCode = "200", description = "Jugador encontrado",
        content = @Content(schema = @Schema(implementation = PlayerDetailResponseDTO.class))),
    @ApiResponse(responseCode = "404", description = "Jugador no encontrado",
        content = @Content(schema = @Schema(implementation = CustomResponse.class),
            examples = @ExampleObject(value = "{\"timestamp\":\"...\",\"status\":404,\"error\":\"Player not found: 1\",\"path\":\"/players/1\"}"))),
    @ApiResponse(responseCode = "503", description = "Servicio de reseñas no disponible",
        content = @Content(schema = @Schema(implementation = CustomResponse.class)))
})
```

**Fallback de Feign con mensaje y código 503:**
```java
@Component
class ReviewFallback implements ReviewClient {
    @Override
    public List<ReviewDTO> getReviewsByPlayerId(Long playerId) {
        return Collections.emptyList();
    }
    @Override
    public ReviewDTO createReview(Long playerId, ReviewDTO review) {
        return null;  // Controller lanza 503 si recibe null
    }
}
```

### Referencias

- **CustomResponse**: `eureka.client.player/src/main/java/draftkings/eureka/client/player/exception/CustomResponse.java`
- **PlayerController**: `eureka.client.player/src/main/java/draftkings/eureka/client/player/controller/PlayerController.java`
- **ReviewClient (fallback)**: `eureka.client.player/src/main/java/draftkings/eureka/client/player/client/ReviewClient.java`

---

## 5. Los microservicios están documentados con Swagger/OpenAPI

### Evaluación/Justificación

Los 3 microservicios de negocio (`playerMS`, `reviewMS`, `userMS`) están documentados con Swagger/OpenAPI:

1. **Dependencia común**: Todos usan `springdoc-openapi-starter-webmvc-ui` versión 3.0.2.

2. **Clases de configuración**: Cada microservicio tiene su `OpenApiConfig.java` con título, descripción, versión y contacto.

3. **Anotaciones completas en Controllers**:
   - `@Tag` en cada controller
   - `@Operation` en cada endpoint
   - `@ApiResponses` con múltiples `@ApiResponse`
   - `@Schema` en modelos
   - `@ExampleObject` con ejemplos JSON
   - `@SecurityRequirement` en endpoints protegidos (userMS)

4. **URLs de Swagger UI**: Cada microservicio expone `/swagger-ui/index.html` y `/v3/api-docs`.

### Fragmentos de Código (Evidencias)

**OpenApiConfig.java (playerMS):**
```java
@Configuration
public class OpenApiConfig {
    @Value("${openapi.title:DraftKings Player Microservice API}")
    private String title;
    @Value("${openapi.description:API REST para la gestión de jugadores}")
    private String description;
    @Value("${openapi.version:1.0.0}")
    private String version;

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI().info(new Info().title(title).description(description).version(version)
                .contact(new Contact().name(contactName).email(contactEmail)));
    }
}
```

**Documentación de controller con anotaciones completas:**
```java
@Tag(name = "Players", description = "CRUD de jugadores y operaciones externas")
@RestController
@RequestMapping("/api/players")
public class PlayerController {

    @Operation(summary = "Obtener listado de jugadores")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Listado obtenido correctamente",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = Player.class)))),
        @ApiResponse(responseCode = "400", description = "Parámetros de paginación inválidos",
            content = @Content(schema = @Schema(implementation = CustomResponse.class)))
    })
    @GetMapping
    public ResponseEntity<Page<Player>> getAllPlayers(...) { ... }
}
```

**Dependencia en pom.xml:**
```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>3.0.2</version>
</dependency>
```

**Títulos configurados en Config Server:**
```yaml
# config-storage/playerMS.yaml
openapi:
  title: "DraftKings Player Microservice API (Local)"
# config-storage/userMS.yaml
openapi:
  title: "DraftKings User Microservice API (Local)"
# config-storage/reviewMS.yaml
openapi:
  title: "DraftKings Review Microservice API (Local)"
```

### Referencias

- **OpenApiConfig (player)**: `eureka.client.player/src/main/java/draftkings/eureka/client/player/config/OpenApiConfig.java`
- **OpenApiConfig (user)**: `eureka.client.user/src/main/java/draftkings/eureka/client/user/config/OpenApiConfig.java`
- **OpenApiConfig (review)**: `eureka.client.review/src/main/java/draftkings/eureka/client/review/config/OpenApiConfig.java`
- **PlayerController**: `eureka.client.player/src/main/java/draftkings/eureka/client/player/controller/PlayerController.java`
- **NewsController**: `eureka.client.player/src/main/java/draftkings/eureka/client/player/controller/NewsController.java`
- **ReviewController**: `eureka.client.review/src/main/java/draftkings/eureka/client/review/controller/ReviewController.java`
- **AuthController**: `eureka.client.user/src/main/java/draftkings/eureka/client/user/controller/AuthController.java`

---

## 6. Se usa un servidor de configuraciones para gestionar la configuración de los microservicios

### Evaluación/Justificación

El proyecto implementa Spring Cloud Config Server como servidor centralizado de configuración:

1. **Config Server**: Módulo `config.server` con `@EnableConfigServer` que lee configuración de este mismo repositorio Git en config-storage.

2. **Repositorio Git**: `config-storage/` contiene YAMLs por microservicio y perfil (default, dev, prod).

3. **Clientes**: Todos los microservicios (`playerMS`, `userMS`, `reviewMS`, `gateway`, `eurekaServer`) se conectan al Config Server via `spring.config.import: "optional:configserver:..."`.

4. **Perfiles**: Soporte completo para entornos local, dev y prod con configuraciones específicas.

### Fragmentos de Código (Evidencias)

**Config Server - @EnableConfigServer:**
```java
@SpringBootApplication
@EnableConfigServer
@EnableDiscoveryClient
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

**Configuración del repositorio Git:**
```yaml
spring:
  cloud:
    config:
      server:
        git:
          uri: https://github.com/dsa069/DraftKings.git
          searchPaths: /api-spring/config-storage
          default-label: dev
```

**Conexión del cliente (playerMS):**
```yaml
spring:
  application:
    name: playerMS
  config:
    import: "optional:configserver:http://localhost:8888"
```

**Archivos YAML en config-storage:**
```
config-storage/
  ├── playerMS.yaml / playerMS-dev.yaml / playerMS-prod.yaml
  ├── userMS.yaml / userMS-dev.yaml / userMS-prod.yaml
  ├── reviewMS.yaml / reviewMS-dev.yaml / reviewMS-prod.yaml
  ├── gateway.yaml / gateway-dev.yaml / gateway-prod.yaml
  └── eurekaServer.yaml / eurekaServer-dev.yaml / eurekaServer-prod.yaml
```

### Referencias

- **Config Server Application**: `config.server/src/main/java/draftkings/config/server/Application.java`
- **Config Server YAML**: `config.server/src/main/resources/application.yaml`
- **Config Storage**: `config-storage/playerMS.yaml`, `config-storage/userMS.yaml`, `config-storage/reviewMS.yaml`
- **Cliente playerMS**: `eureka.client.player/src/main/resources/application.yaml`
- **Cliente userMS**: `eureka.client.user/src/main/resources/application.yaml`
- **Cliente reviewMS**: `eureka.client.review/src/main/resources/application.yaml`

---

## 7. Se utiliza Eureka como directorio para el registro y descubrimiento de los microservicios

### Evaluación/Justificación

El proyecto implementa Netflix Eureka para el registro y descubrimiento de servicios:

1. **Eureka Server**: Módulo `eureka.server` con `@EnableEurekaServer` que registra todos los microservicios.

2. **Eureka Clients**: Los 5 microservicios restantes (`playerMS`, `userMS`, `reviewMS`, `gateway`, `configServer`) usan `@EnableDiscoveryClient` para registrarse.

3. **Gateway**: Usa `lb://` en las rutas para balanceo de carga basado en Eureka.

4. **Feign**: Los clientes Feign resuelven nombres de servicio via Eureka.

5. **Configuración**: Self-preservation desactivado para desarrollo, registro con instance IDs únicos.

### Fragmentos de Código (Evidencias)

**Eureka Server - @EnableEurekaServer:**
```java
@SpringBootApplication
@EnableEurekaServer
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

**Eureka Client (playerMS) - @EnableDiscoveryClient:**
```java
@SpringBootApplication
@EnableFeignClients
@EnableDiscoveryClient
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

**Configuración de Eureka Client:**
```yaml
eureka:
  instance:
    hostname: localhost
    instance-id: ${eureka.instance.hostname}:${spring.application.name}:${spring.application.instance_id:${random.value}}
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
```

**Gateway usando lb:// para balanceo de carga:**
```yaml
spring:
  cloud:
    gateway:
      server:
        webflux:
          routes:
            - id: playerms-openapi
              uri: lb://playerMS
              predicates:
                - Path=/v3/api-docs/**
```

### Referencias

- **Eureka Server Application**: `eureka.server/src/main/java/draftkings/eureka/server/Application.java`
- **Eureka Server YAML**: `eureka.server/src/main/resources/application.yaml`
- **PlayerMS Application**: `eureka.client.player/src/main/java/draftkings/eureka/client/player/Application.java`
- **UserMS Application**: `eureka.client.user/src/main/java/draftkings/eureka/client/user/Application.java`
- **ReviewMS Application**: `eureka.client.review/src/main/java/draftkings/eureka/client/review/Application.java`
- **Gateway Application**: `gateway/src/main/java/draftkings/gateway/GatewayApplication.java`
- **Gateway YAML**: `gateway/src/main/resources/application.yaml`

---

## 8. Se utiliza Feign para la comunicación entre el microservicio encargado de los jugadores y el microservicio encargado de los comentarios

### Evaluación/Justificación

El proyecto usa Spring Cloud OpenFeign para la comunicación entre microservicios:

1. **Feign Client en playerMS**: `ReviewClient` se comunica con `reviewMS` para operaciones CRUD de reviews de juagdores.

2. **Feign Client en userMS**: `ReviewClient` se comunica con `reviewMS` para obtener reviews de usuario (Sin uso actual).

3. **Resolución via Eureka**: Los clientes usan el nombre del servicio (`value = "reviewMS"`) que se resuelve via Eureka.

4. **Fallbacks**: Ambos clientes implementan fallbacks que devuelven listas vacías o null cuando reviewMS no está disponible.

5. **Circuit Breaker integrado**: La configuración `spring.cloud.openfeign.circuitbreaker.enabled: true` habilita la integración con Resilience4j.

### Fragmentos de Código (Evidencias)

**Feign Client en playerMS:**
```java
@FeignClient(value = "reviewMS", fallback = ReviewClient.ReviewFallback.class)
public interface ReviewClient {

    @GetMapping("/api/players/{playerId}/reviews")
    List<ReviewDTO> getReviewsByPlayerId(@PathVariable("playerId") Long playerId);

    @PostMapping("/api/players/{playerId}/reviews")
    ReviewDTO createReview(@PathVariable("playerId") Long playerId, @RequestBody ReviewDTO review);

    @PutMapping("/api/reviews/{id}")
    ReviewDTO updateReview(@PathVariable("id") Long id, @RequestBody ReviewDTO reviewDetails);

    @DeleteMapping("/api/reviews/{id}")
    void deleteReview(@PathVariable("id") Long id);

    @Component
    class ReviewFallback implements ReviewClient {
        @Override
        public List<ReviewDTO> getReviewsByPlayerId(Long playerId) {
            return Collections.emptyList();
        }
        @Override
        public ReviewDTO createReview(Long playerId, ReviewDTO review) {
            return null;
        }
        @Override
        public void deleteReview(Long id) {
            // Fallo silencioso
        }
    }
}
```

**Feign Client en userMS:**
```java
@FeignClient(value = "reviewMS", fallback = ReviewClient.ReviewFallback.class)
public interface ReviewClient {

    @GetMapping
    List<ReviewDTO> getReviewsByUserId(@RequestParam("userId") Long userId);

    @Component
    class ReviewFallback implements ReviewClient {
        @Override
        public List<ReviewDTO> getReviewsByUserId(Long userId) {
            return Collections.emptyList();
        }
    }
}
```

**Uso en PlayerServiceImpl:**
```java
@Service
public class PlayerServiceImpl implements PlayerService {
    private final ReviewClient reviewFeignClient;

    public PlayerDetailResponseDTO getPlayerProfileWithReviews(Long playerId) {
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new ResourceNotFoundException(...));
        List<ReviewDTO> reviews;
        try {
            reviews = reviewFeignClient.getReviewsByPlayerId(playerId);
            if (reviews == null) {
                reviews = List.of();
            }
        } catch (Exception e) {
            reviews = List.of();
        }
        return new PlayerDetailResponseDTO(player, reviews);
    }
}
```

**Habilitación de circuit breaker para Feign:**
```yaml
spring:
  cloud:
    openfeign:
      circuitbreaker:
        enabled: true
```

### Referencias

- **ReviewClient (playerMS)**: `eureka.client.player/src/main/java/draftkings/eureka/client/player/client/ReviewClient.java`
- **ReviewClient (userMS)**: `eureka.client.user/src/main/java/draftkings/eureka/client/user/client/ReviewClient.java`
- **PlayerServiceImpl**: `eureka.client.player/src/main/java/draftkings/eureka/client/player/service/PlayerServiceImpl.java`
- **UserServiceImpl**: `eureka.client.user/src/main/java/draftkings/eureka/client/user/service/UserServiceImpl.java`
- **Config Feign playerMS**: `eureka.client.player/src/main/resources/application.yaml`
- **Config Feign userMS**: `eureka.client.user/src/main/resources/application.yaml`

---

## 9. Se ha utilizado Stencil para implementar uno o varios componentes para la visualización de los datos de los jugadores

### Evaluación/Justificación

El proyecto implementa 3 Web Components con Stencil.js para la visualización de datos:

1. **player-dashboard**: Componente raíz que controla la navegación entre lista y detalle usando estado interno.

2. **player-list**: Listado paginado de jugadores con tarjetas, CSS Grid responsive y paginación.

3. **player-detail**: Vista detallada de un jugador con datos personales, club y ubicación.

4. **Stencil Config**: Configurado con 4 outputTargets (dist, dist-custom-elements, docs-readme, www).

5. **Shadow DOM**: Activado en los 3 componentes para encapsulamiento de estilos.

6. **Comunicación**: Usa `@Prop` y `@Event` (CustomEvents) para la comunicación padre-hijo.

### Fragmentos de Código (Evidencias)

**stencil.config.ts:**
```typescript
import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'jugadores-frontend',
  outputTargets: [
    { type: 'dist', esmLoaderPath: '../loader' },
    { type: 'dist-custom-elements', customElementsExportBehavior: 'auto-define-custom-elements', externalRuntime: false },
    { type: 'docs-readme' },
    { type: 'www', serviceWorker: null },
  ],
};
```

**player-dashboard.tsx:**
```typescript
@Component({ tag: 'player-dashboard', shadow: true })
export class PlayerDashboard {
  @State() selectedPlayerId: number | null = null;
  @State() detailedPlayer: any = null;
  @State() loadingDetail: boolean = false;

  private apiUrl = 'http://localhost:8080/playerms/api/players';

  async handlePlayerSelected(event: CustomEvent<number>) {
    const id = event.detail;
    this.selectedPlayerId = id;
    this.loadingDetail = true;
    try {
      const response = await fetch(`${this.apiUrl}/${id}`);
      if (response.ok) {
        this.detailedPlayer = await response.json();
      }
    } catch (error) {
      console.error('Error trayendo el detalle:', error);
    } finally {
      this.loadingDetail = false;
    }
  }

  render() {
    if (this.loadingDetail) {
      return <div>Cargando expediente del jugador...</div>;
    }
    if (this.selectedPlayerId && this.detailedPlayer) {
      return <player-detail player={this.detailedPlayer.player}
                onBackToList={() => this.handleBackToList()}></player-detail>;
    }
    return <player-list onPlayerSelected={this.handlePlayerSelected.bind(this)}></player-list>;
  }
}
```

**player-list.tsx:**
```typescript
@Component({ tag: 'player-list', styleUrl: 'player-list.css', shadow: true })
export class PlayerList {
  @State() players: any[] = [];
  @State() loading: boolean = true;
  @State() currentPage: number = 0;
  @State() totalPages: number = 1;

  @Event() playerSelected!: EventEmitter<number>;

  private apiUrl = 'http://localhost:8080/playerms/api/players';

  async componentWillLoad() {
    await this.fetchPlayers(this.currentPage);
  }

  async fetchPlayers(page: number) {
    this.loading = true;
    try {
      const response = await fetch(`${this.apiUrl}?page=${page}&size=10`);
      if (response.ok) {
        const data = await response.json();
        this.players = data.content;
        this.totalPages = data.totalPages;
      }
    } finally {
      this.loading = false;
    }
  }

  render() {
    if (this.loading) return <div class="loading-box">Buscando jugadores...</div>;
    return (
      <div class="list-container">
        <h2>Listado de Jugadores</h2>
        <div class="grid">
          {this.players.map(player => (
            <div class="player-card" onClick={() => this.playerSelected.emit(player.id)}>
              <img src={player.photoUrl || 'https://via.placeholder.com/150'} alt={player.name} />
              <div class="card-body">
                <h3>{player.name}</h3>
                <p>{player.team} • {player.position}</p>
              </div>
            </div>
          ))}
        </div>
        <div class="pagination">
          <button disabled={this.currentPage === 0}
                  onClick={() => this.fetchPlayers(this.currentPage - 1)}>Anterior</button>
          <span>Página {this.currentPage + 1} de {this.totalPages}</span>
          <button disabled={this.currentPage >= this.totalPages - 1}
                  onClick={() => this.fetchPlayers(this.currentPage + 1)}>Siguiente</button>
        </div>
      </div>
    );
  }
}
```

**player-detail.tsx:**
```typescript
@Component({ tag: 'player-detail', styleUrl: 'player-detail.css', shadow: true })
export class PlayerDetail {
  @Prop() player: any;
  @Event() backToList!: EventEmitter<void>;

  render() {
    if (!this.player) return <div>No hay datos del jugador.</div>;
    return (
      <div class="detail-container">
        <button class="back-btn" onClick={() => this.backToList.emit()}>Volver al listado</button>
        <div class="profile-header">
          <img src={this.player.photoUrl || 'https://via.placeholder.com/150'} alt={this.player.name} />
          <div class="header-info">
            <h1>{this.player.firstName} {this.player.lastName}</h1>
            <p class="badge">{this.player.position} #{this.player.number || 'N/A'}</p>
          </div>
        </div>
        <div class="info-grid">
          <div class="info-card">
            <h3>Datos Personales</h3>
            <div class="info-row"><strong>Edad:</strong> <span>{this.player.age} años</span></div>
            <div class="info-row"><strong>Nacionalidad:</strong> <span>{this.player.nationality}</span></div>
          </div>
        </div>
      </div>
    );
  }
}
```

### Referencias

- **stencil.config.ts**: `jugadores-frontend/stencil.config.ts`
- **player-dashboard.tsx**: `jugadores-frontend/src/components/player-dashboard/player-dashboard.tsx`
- **player-list.tsx**: `jugadores-frontend/src/components/player-list/player-list.tsx`
- **player-detail.tsx**: `jugadores-frontend/src/components/player-detail/player-detail.tsx`
- **player-list.css**: `jugadores-frontend/src/components/player-list/player-list.css`
- **player-detail.css**: `jugadores-frontend/src/components/player-detail/player-detail.css`
- **package.json**: `jugadores-frontend/package.json`

---

## 10. Calidad de todo el material entregado

### Evaluación/Justificación

El proyecto demuestra calidad técnica en múltiples aspectos:

**a) Calidad del código:**
- Separación de capas clara: controller/service/repository/domain/dto/exception
- 14 archivos de test unitarios con JUnit 5 + Mockito
- JaCoCo configurado para medición de cobertura
- DTOs para separar capas y ocultar entidades internas
- Manejo de excepciones personalizado con handler global

**b) Calidad de las interfaces web:**
- Stencil.js con Web Components y Shadow DOM
- CSS Grid responsive con paleta de colores profesional (slate/indigo)
- Animaciones y transiciones suaves (hover effects)
- Google Fonts (Plus Jakarta Sans)

**c) Calidad de la infraestructura:**
- Arquitectura de microservicios completa
- Spring Cloud (Config, Eureka, Gateway, Feign, Circuit Breaker)
- Dockerfiles para dev y prod
- DevContainer para desarrollo local

### Fragmentos de Código (Evidencias)

**Estructura de paquetes (playerMS):**
```
eureka.client.player/src/main/java/draftkings/eureka/client/player/
├── config/          # OpenApiConfig, CorsConfig
├── controller/      # PlayerController, NewsController, TacticController
├── service/         # PlayerServiceImpl, NewsServiceImpl, ApiFootballServiceImpl, AiTacticServiceImpl
├── repository/      # PlayerRepository
├── domain/          # Player
├── dto/             # PlayerDetailResponseDTO, ReviewDTO, NewsDTO, etc.
├── client/          # ReviewClient (Feign)
└── exception/       # HandlerExceptionResolverImpl, CustomResponse, Exceptions
```

**Test unitario representativo (PlayerControllerTest):**
```java
@ExtendWith(MockitoExtension.class)
class PlayerControllerTest {
    @Mock private PlayerRepository playerRepository;
    @Mock private PlayerService playerService;
    @Mock private ApiFootballService apiFootballService;
    @Mock private ReviewClient reviewClient;

    private PlayerController controller;

    @BeforeEach
    void setUp() {
        controller = new PlayerController(playerRepository, playerService, apiFootballService, reviewClient);
    }

    @Test
    void getAllPlayersShouldThrowBadRequestWhenPaginationInvalid() {
        assertThrows(BadRequestException.class,
                () -> controller.getAllPlayers(null, null, null, null, -1, 10));
    }
}
```

**Configuración CORS en Gateway:**
```java
@Configuration
@ConfigurationProperties(prefix = "app.cors")
public class CorsConfig {
    private List<String> allowedOrigins = new ArrayList<>(List.of("http://localhost:8100"));

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration corsConfig = new CorsConfiguration();
        corsConfig.setAllowedOrigins(allowedOrigins);
        corsConfig.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        corsConfig.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);
        return new CorsWebFilter(source);
    }
}
```

**Dockerfile:**
```dockerfile
FROM eclipse-temurin:17-jre
EXPOSE 8080
ENV SPRING_PROFILES_ACTIVE=dev
ARG JAR_FILE=target/*.jar
COPY ${JAR_FILE} app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
```

### Referencias

- **PlayerControllerTest**: `eureka.client.player/src/test/java/draftkings/eureka/client/player/controller/PlayerControllerTest.java`
- **ReviewControllerTest**: `eureka.client.review/src/test/java/draftkings/eureka/client/review/controller/ReviewControllerTest.java`
- **AuthControllerTest**: `eureka.client.user/src/test/java/draftkings/eureka/client/user/controller/AuthControllerTest.java`
- **CorsConfig**: `gateway/src/main/java/draftkings/gateway/config/CorsConfig.java`
- **Dockerfile**: `eureka.client.player/Dockerfile`

---

## 11. Matrícula de Honor: Uso del patrón Circuit Breaker

### Evaluación/Justificación

El proyecto implementa el patrón Circuit Breaker con Resilience4j para garantizar la resiliencia:

1. **Dependencia**: `spring-cloud-starter-circuitbreaker-resilience4j` en playerMS y userMS.

2. **Circuit Breakers configurados**:
   - `corbaNews`: Protege las llamadas al sistema CORBA de noticias
   - `apiFootball`: Protege las llamadas a la API externa de fútbol

3. **Fallbacks inteligentes**:
   - Para CORBA: Distingue entre `CallNotPermittedException` (503) y errores de validación (4xx)
   - Para API-Football: Siempre devuelve 503
   - Para Feign/ReviewMS: Devuelve listas vacías o null

4. **Integración con Feign**: `spring.cloud.openfeign.circuitbreaker.enabled: true` habilita circuit breaker en las llamadas Feign.

### Fragmentos de Código (Evidencias)

**Annotación @CircuitBreaker en NewsServiceImpl:**
```java
@CircuitBreaker(name = "corbaNews", fallbackMethod = "getAllNewsFallback")
public List<NewsDTO> getAllNews() {
    // Llamada al sistema CORBA via RestTemplate
    String requestUri = newsApiUrl + "?action=Obtener+todas&format=json";
    ResponseEntity<String> response = restTemplate.exchange(requestUri, HttpMethod.GET, entity, String.class);
    // ...
}

public List<NewsDTO> getAllNewsFallback(Throwable t) {
    if (t instanceof CallNotPermittedException) {
        throw new ServiceUnavailableException("El sistema externo de noticias (CORBA) no está disponible", t);
    }
    throw new InternalServerErrorException("Error al comunicarse con el sistema de noticias", t);
}
```

**Annotación @CircuitBreaker en ApiFootballServiceImpl:**
```java
@CircuitBreaker(name = "apiFootball", fallbackMethod = "searchExternalPlayersFallback")
public List<PlayerExternalDTO> searchExternalPlayers(String search) {
    // Llamada a la API externa de fútbol
    ResponseEntity<String> response = restTemplate.exchange(requestUri, HttpMethod.GET, entity, String.class);
    // ...
}

public List<PlayerExternalDTO> searchExternalPlayersFallback(String search, Throwable throwable) {
    System.err.println("API-Football is down or unavailable: " + throwable.getMessage());
    throw new ServiceUnavailableException("Failed to fetch players from external API", throwable);
}
```

**Fallback de Feign para ReviewMS:**
```java
@FeignClient(value = "reviewMS", fallback = ReviewClient.ReviewFallback.class)
public interface ReviewClient {
    @Component
    class ReviewFallback implements ReviewClient {
        @Override
        public List<ReviewDTO> getReviewsByPlayerId(Long playerId) {
            return Collections.emptyList();  // Si reviewMS cae → lista vacía
        }
        @Override
        public ReviewDTO createReview(Long playerId, ReviewDTO review) {
            return null;  // Controller lanza 503 si recibe null
        }
    }
}
```

**Protección en PlayerController para fallback null:**
```java
ReviewDTO createdReview = reviewClient.createReview(playerId, review);
if (createdReview == null) {
    throw new ServiceUnavailableException("Servicio de reseñas no disponible");
}
```

**Configuración de circuit breaker para Feign:**
```yaml
spring:
  cloud:
    openfeign:
      circuitbreaker:
        enabled: true
```

### Referencias

- **NewsServiceImpl**: `eureka.client.player/src/main/java/draftkings/eureka/client/player/service/NewsServiceImpl.java`
- **ApiFootballServiceImpl**: `eureka.client.player/src/main/java/draftkings/eureka/client/player/service/ApiFootballServiceImpl.java`
- **ReviewClient (playerMS)**: `eureka.client.player/src/main/java/draftkings/eureka/client/player/client/ReviewClient.java`
- **PlayerController**: `eureka.client.player/src/main/java/draftkings/eureka/client/player/controller/PlayerController.java`
- **Config Resilience4j**: `eureka.client.player/src/main/resources/application.yaml`
- **pom.xml (dependencia)**: `eureka.client.player/pom.xml`

---

## Resumen de Puntuación

| Criterio | Puntos | Estado |
|----------|--------|--------|
| 1. ORB/CORBA para noticias | 1 | ✅ Cumplido |
| 2. Spring Data para persistencia | 1 | ✅ Cumplido |
| 3. Gestión de códigos HTTP | 1 | ✅ Cumplido |
| 4. Mostrar resultados (resultado, mensaje, código HTTP) | 1 | ✅ Cumplido |
| 5. Swagger/OpenAPI | 1 | ✅ Cumplido |
| 6. Servidor de configuraciones | 1 | ✅ Cumplido |
| 7. Eureka para registro/descubrimiento | 1 | ✅ Cumplido |
| 8. Feign para comunicación inter-microservicios | 1 | ✅ Cumplido |
| 9. Stencil para componentes web | 1 | ✅ Cumplido |
| 10. Calidad del material | 1 | ✅ Cumplido |
| **Total** | **10** | **✅** |
| **Matrícula: Circuit Breaker** | +1 | ✅ Cumplido |
