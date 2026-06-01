CONTENIDO DETALLADO PARA LA PRESENTACIÓN - DraftKings
DIAPOSITIVA 1: PORTADA
Título: DraftKings - Gestión de Jugadores y Estadísticas de Fútbol
Subtítulo: Aplicación Híbrida Multi-Backend con Angular/Ionic, Node.js, Spring Boot y CORBA
Elementos visuales:
- Logo de DraftKings (DK-logo.png) en centro
- Iconos de las tecnologías: Angular, Ionic, Node.js, Spring Boot, CORBA, GCP, Docker
- Nombre del equipo / integrantes
- Asignaturas: CNSA (CI/CD), DAH (Ionic/Angular), DWSC (Spring Boot), TRWM (Node.js API)
- Fecha de presentación
DIAPOSITIVA 2: VISIÓN GENERAL DEL PROYECTO
Título: ¿Qué es DraftKings?
Contenido:
DraftKings es una aplicación móvil híbrida para la gestión de jugadores y estadísticas de fútbol. Permite a los usuarios crear, buscar, comentar y valorar jugadores, así como generar equipos ideales con ayuda de Inteligencia Artificial.
Actores del sistema (diagrama de jerarquía):
Usuario Común
    ├── Usuario No Registrado → puede: registrarse, ver listado, buscar jugadores
    └── Usuario Registrado → puede: todo lo anterior + importar jugadores, crear comentarios, generar equipo ideal, ver noticias
         └── Usuario Administrador → puede: todo lo anterior + editar/eliminar jugadores, borrar comentarios, crear noticias
Funcionalidades principales:
Funcionalidad	Descripción
Registro/Login	Firebase Auth con sincronización JIT al backend
Listado de jugadores	Paginado con filtros por nombre, equipo/liga, fecha de alta
Búsqueda de jugadores	Filtros combinables sobre base de datos local
Detalle de jugador	Datos personales + imagen + comentarios con valoración 0-5 estrellas
Importar desde API externa	Búsqueda en API-Football, selección e importación masiva
Crear jugador (formulario)	Con cámara/URL para imagen + geolocalización en mapa
Equipo Ideal (IA)	Groq (Node) o Spring AI (Spring) recomienda jugadores para posiciones vacías
Noticias de jugadores	Sistema CORBA con productor (admin) y consumidor
Gestión de usuarios	Admin puede editar/eliminar jugadores y comentarios
Esquema sugerido: Diagrama de casos de uso simplificado con los 4 actores y sus funcionalidades principales, usando flechas de inclusión/extensión.
DIAPOSITIVA 3: ARQUITECTURA Y STACK TECNOLÓGICO
Título: Arquitectura Multi-Backend
Contenido:
La aplicación sigue una arquitectura distribuida con un frontend unificado que puede conmutar entre dos backends completamente independientes en tiempo de ejecución.
Diagrama de arquitectura (esquema de bloques):
┌─────────────────────────────────────────────────────┐
│                   FRONTEND                          │
│         Ionic 8 + Angular 21 (Standalone)           │
│                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │  Strategy   │  │   Factory    │  │  Backend  │  │
│  │  Pattern    │  │   Pattern    │  │  Toggle   │  │
│  └─────────────┘  └──────────────┘  └───────────┘  │
│         │                │                           │
│    ┌────┴────────────────┴────┐                     │
│    │   Abstract Services      │                     │
│    │  (AuthService, Player,   │                     │
│    │   Review, News, Team)    │                     │
│    └────┬────────────────┬────┘                     │
└─────────┼────────────────┼──────────────────────────┘
          │                │
    ┌─────┴─────┐    ┌────┴──────────────────────────┐
    │  NODE.JS  │    │        SPRING BOOT             │
    │  Express  │    │   Cloud Native Microservices    │
    │  MongoDB  │    │   PostgreSQL (Supabase)        │
    └───────────┘    │                                │
                     │  ┌─────────┐ ┌──────────────┐ │
                     │  │ Eureka  │ │Config Server │ │
                     │  │ Server  │ │              │ │
                     │  └─────────┘ └──────────────┘ │
                     │  ┌─────────┐ ┌──────────────┐ │
                     │  │Gateway  │ │PlayerMS      │ │
                     │  │         │ │ReviewMS      │ │
                     │  │         │ │UserMS        │ │
                     │  └─────────┘ └──────────────┘ │
                     └────────────┬───────────────────┘
                                  │
                     ┌────────────┴───────────┐
                     │    CORBA SERVICES      │
                     │    Java 8 + Tomcat     │
                     │    Buffer IDL → ORB    │
                     │    Servlet Bridge      │
                     └────────────────────────┘
Tabla de tecnologías:
Capa	Tecnología	Versión	Propósito
Frontend	Angular + Ionic	21 + 8	SPA híbrida móvil
Native	Capacitor	8	Cámara, Geolocalización, Preferences
Auth	Firebase	12	Authentication + Storage
Backend Node	Express + Mongoose	5 + 9	REST API + MongoDB
Backend Spring	Spring Boot + Cloud	3.x	Microservicios (6 MS)
Service Discovery	Eureka	-	Registro y descubrimiento
Config	Spring Cloud Config	-	Configuración centralizada
API Gateway	Spring Cloud Gateway	-	Routing + balanceo de carga
Inter-MS	OpenFeign + Resilience4j	-	Comunicación + Circuit Breaker
News	CORBA (Java 8)	-	Sistema distribuido de noticias
IA Node	LangChain + Groq	-	Recomendaciones tácticas
IA Spring	Spring AI	-	Recomendaciones tácticas
DB Node	MongoDB Atlas	-	Base de datos NoSQL
DB Spring	PostgreSQL (Supabase)	-	Base de datos relacional
Infra	GCP Cloud Run + VM	-	Despliegue
IaC	Terraform	7.22	Infraestructura como código
CI/CD	GitHub Actions	-	13 workflows
Esquema sugerido: Los bloques de arquitectura como rectángulos conectados con flechas, colores diferentes por capa (frontend azul, node verde, spring naranja, corba rojo, infra gris).
DIAPOSITIVA 4: MODELO DE DATOS
Título: Modelo de Datos - Diagrama ER
Contenido:
Diagrama Entidad-Relación:
┌──────────────────────┐         ┌──────────────────────────┐
│       users           │         │         player            │
├──────────────────────┤         ├──────────────────────────┤
│ * id        INT (PK) │         │ * id        INT (PK)     │
│ * email     VARCHAR   │         │ * name      VARCHAR(100) │
│ * userName  VARCHAR   │         │   firstName VARCHAR(100) │
│ * password  VARCHAR   │         │   lastName  VARCHAR(100) │
│ * role      VARCHAR   │         │   age       TINYINT       │
│   created_at TIMESTAMP│         │   birthdate DATE          │
│                       │         │   nationality VARCHAR     │
│ CHECK: role IN        │         │   height    DECIMAL       │
│  (USER, ADMIN)        │         │   weight    DECIMAL       │
└───────────┬───────────┘         │   number    TINYINT       │
            │                     │   team      VARCHAR(150)  │
            │ writes              │   league    VARCHAR(150)  │
            │                     │   position  VARCHAR(50)   │
            │                     │   photoUrl  VARCHAR(255)  │
            │                     │ * latitude  DECIMAL(10,8) │
            │                     │ * longitude DECIMAL(11,8) │
            │                     │   created_at TIMESTAMP    │
            │                     │                           │
            │                     │ CHECK: lat BETWEEN -90/90 │
            │                     │ CHECK: lng BETWEEN -180/180│
            │                     └─────────────┬─────────────┘
            │                                   │
            │    ┌──────────────────────────────┘
            │    │ has
            │    ▼
┌───────────┴────────────────────────────────────┐
│                   review                        │
├────────────────────────────────────────────────┤
│ * id         INT (PK)                          │
│ * user_id    INT (FK → users)                  │
│ * player_id  INT (FK → player)                 │
│ * author     VARCHAR(100)                      │
│ * text       VARCHAR(1000)                     │
│ * rating     TINYINT (0-5)                     │
│ * latitude   DECIMAL(10, 8)                    │
│ * longitude  DECIMAL(11, 8)                    │
│   created_at TIMESTAMP                         │
│                                                 │
│ CHECK: rating BETWEEN 0 AND 5                  │
│ CHECK: lat BETWEEN -90 AND 90                  │
│ CHECK: lng BETWEEN -180 AND 180                │
└────────────────────────────────────────────────┘
Relaciones:
- users 1───N review (un usuario escribe muchos comentarios)
- player 1───N review (un jugador tiene muchos comentarios)
Geolocalización (Node.js - GeoJSON):
// En Node.js (MongoDB), las coordenadas se almacenan como GeoJSON Point
coords: {
  type: "Point",
  coordinates: [longitude, latitude]  // GeoJSON format
}
// Con índice 2dsphere para consultas geoespaciales
playerSchema.index({ coords: "2dsphere" });
Esquema sugerido: Diagrama ER con rectángulos para entidades, líneas con cardinalidades (1, N), colores diferentes por entidad. Incluir icono de pin de mapa junto a las coordenadas para indicar geolocalización.
DIAPOSITIVA 5: API REST - ENDPOINTS
Título: API REST - 16 Endpoints
Contenido:
Tabla de endpoints:
#	Método	URL	Descripción
1	POST	/api/user/sync	Registrar/sincronizar usuario (JIT)
2	GET	/api/user/profile	Obtener perfil del usuario autenticado
3	GET	/api/players	Listado paginado con filtros (search, team, league, startDate)
4	GET	/api/players/:id	Detalle de un jugador
5	POST	/api/players	Crear jugador (formulario interno)
6	GET	/api/players/external	Buscar jugadores en API-Football externa
7	POST	/api/players/import	Importar jugadores desde API externa
8	PUT	/api/players/:id	Editar datos de un jugador
9	DELETE	/api/players/:id	Eliminar un jugador
10	GET	/api/players/:id/reviews	Obtener comentarios de un jugador
11	POST	/api/players/:id/reviews	Crear comentario para un jugador
12	PUT	/api/reviews/:id	Editar comentario
13	DELETE	/api/reviews/:id	Eliminar comentario
14	GET	/api/news	Obtener noticias de jugadores
15	GET	/api/news/:id	Ver noticia en detalle
16	POST	/api/news	Publicar noticia (solo admin)
17	POST	/api/tactics/recommendations	Generar equipo ideal con IA
Códigos HTTP utilizados:
- 200 OK — Operación exitosa
- 201 Created — Recurso creado
- 204 No Content — Eliminación exitosa
- 400 Bad Request — Parámetros inválidos
- 401 Unauthorized — Token ausente o inválido
- 403 Forbidden — Sin permisos de administrador
- 404 Not Found — Recurso no encontrado
- 500 Internal Server Error — Error interno
- 503 Service Unavailable — Servicio externo caído (API-Football, CORBA)
Documentación Swagger:
- Node.js: http://localhost:3000/api-docs/
- Spring PlayerMS: http://localhost:8090/swagger-ui/index.html
- Spring ReviewMS: http://localhost:8091/swagger-ui/index.html
- Spring UserMS: http://localhost:8092/swagger-ui/index.html
Esquema sugerido: Tabla con colores por tipo de operación (GET azul, POST verde, PUT amarillo, DELETE rojo). Icono de candado junto a los que requieren auth.
DIAPOSITIVA 6: ORGANIZACIÓN DEL REPOSITORIO
Título: Organización del Repositorio Git
Contenido:
Estructura de ramas (GitFlow):
main ──────────────────────────────────────────────●─────── (producción)
                                                   │
                                              merge (squash)
                                                   │
dev ─────●────●────●────●────●────●────●────●────●──────── (desarrollo)
         │    │         │              │         │
         │    │         │              │         └── feature/corba-ci
         │    │         │              └── feature/spring-ai
         │    │         └── feature/import-players
         │    └── feature/reviews-crud
         └── feature/auth-firebase
Política de ramas:
Rama	Origen	Destino	Estrategia de merge
feature/*	dev	dev	Rebase sobre dev (sin merge commits)
dev	-	main	Squash and merge (un commit limpio por feature)
main	Solo desde dev	-	Protegida — no se permite merge directo
Reglas estrictas:
1. Rebase en feature branches: Las features se rebasean sobre dev antes de mergear, manteniendo una historia lineal
2. Squash desde dev: Cuando dev se mergea en main, se usa squash para comprimir todos los commits de una feature en un solo commit limpio
3. No se permite merge directo a main: Solo dev puede hacer PR hacia main
Issues y gestión del proyecto:
Issues de GitHub con labels:
├── Feature (verde)     → Nuevas funcionalidades
├── Bug (rojo)          → Corrección de errores
├── Enhancement (azul)  → Mejoras a funcionalidad existente
├── CI/CD (naranja)     → Problemas de pipeline
├── Documentation (morado) → Documentación
└── Testing (amarillo)  → Pruebas
Tablero Kanban (GitHub Projects):
┌──────────┬───────────────┬──────────────┬──────────┐
│ Backlog  │  In Progress  │    Review    │   Done   │
├──────────┼───────────────┼──────────────┼──────────┤
│ Feature  │ Feature       │ Feature      │ Feature  │
│  ...     │  ...          │  ...         │  ...     │
│          │               │              │          │
│ Bug      │ Bug           │              │ Bug      │
│  ...     │  ...          │              │  ...     │
└──────────┴───────────────┴──────────────┴──────────┘
Milestones (hitsos por fase):
Milestone	Contenido
Fase 1: Base	Auth Firebase, CRUD Jugadores, CRUD Reviews
Fase 2: Integración	API-Football, Geolocalización, Cámara
Fase 3: Inteligencia	IA LangChain+Groq / Spring AI, Equipo Ideal
Fase 4: Distribuido	CORBA News, Spring Cloud (Eureka, Config, Gateway)
Fase 5: CI/CD	GitHub Actions, Docker, GCP, Terraform
Fase 6: Calidad	Tests E2E, SonarQube, APK firmado, Documentación
Esquema sugerido: Dibujo de un árbol de ramas Git con colores (main en rojo, dev en azul, features en verde). Tablero Kanban como columnas con post-its. Timeline de milestones.
DIAPOSITIVA 7: POLÍTICA DE BRANCHING Y CI CHECKS
Título: Política de Branching y Quality Gates
Contenido:
Flujo de merge con protecciones:
feature/my-feature
        │
        ▼ (rebase sobre dev)
        │
   ┌────┴────┐
   │  Checks  │ ← GitHub Actions se ejecutan automáticamente
   │  CI/CD   │
   └────┬────┘
        │
        ▼ (merge a dev)
        │
      dev ────────●────●────●────●────
                                   │
                              (squash and merge)
                                   │
                              ┌────┴────┐
                              │ Checks  │ ← Mismos checks + verificación de rama origen
                              │ CI/CD   │
                              └────┬────┘
                                   │
                                   ▼
                              main ────────●────●────
Checks de GitHub Actions obligatorios (quality gates):
Los siguientes checks deben pasar antes de permitir un merge. Si alguno falla, el merge se bloquea automáticamente.
Check	Componente	Qué verifica
build	Node.js	Compilación TypeScript exitosa
lint	Node.js	ESLint sin errores
test	Node.js	Jest tests unitarios + integración
coverage	Node.js	Cobertura de código
build	Spring Boot	Maven compile (6 microservicios en matrix)
checkstyle	Spring Boot	Google Checks style
test	Spring Boot	JUnit 5 tests
jacoco	Spring Boot	Cobertura mínima 60%
build	CORBA	Java 8 compile + idlj
checkstyle	CORBA	Google Checks style
test	CORBA	JaCoCo tests
build	Ionic	Angular build + lint
component-tests	Ionic	Cypress component tests (Chrome + Firefox)
e2e-tests	Ionic	Cypress E2E tests (Chrome + Firefox)
sonarqube	Todos	Análisis estático SonarQube
check-pr-main	Git flow	Verifica que PR a main viene de dev
Verificación de rama origen (check-pr-main.yml):
# workflow: check-pr-main.yml
# Trigger: pull_request hacia main
# Verificación: solo permite PRs cuya rama origen sea 'dev'

on:
  pull_request:
    branches: [main]

jobs:
  main_check_source:
    runs-on: ubuntu-latest
    steps:
      - name: Verify that branch is 'dev'
        if: github.head_ref != 'dev'
        run: |
          echo "ERROR: Solo se permiten Merges a 'main' desde la rama 'dev'."
          exit 1  # ← FALLO = merge bloqueado
Resultado:
- Si el PR viene de dev → pasa (exit 0)
- Si el PR viene de cualquier otra rama → falla → merge bloqueado
Estrategia de merge:
Operación	Comando	Resultado
Feature → dev	git rebase dev + merge	Historia lineal, sin merge commits
dev → main	Squash and merge	Un solo commit por feature en main
Esquema sugerido: Flujo horizontal con flechas, iconos de candado en los checks, semáforo verde/rojo para indicar pass/fail. Diagrama de pipelines apilados.
DIAPOSITIVA 8: CI/CD PIPELINE
Título: CI/CD - 13 Workflows de GitHub Actions
Contenido:
Vista general de pipelines:
┌─────────────────────────────────────────────────────────────────┐
│                     GITHUB ACTIONS                              │
│                                                                 │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  node-ci    │  │ spring-ci    │  │  corba-ci    │          │
│  │  (105 líneas)│  │ (160 líneas) │  │ (250 líneas) │          │
│  └──────┬──────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                │                  │                   │
│    ┌────┴────┐     ┌────┴────┐        ┌────┴────┐             │
│    │node-cd  │     │spring-cd│        │corba-cd │             │
│    │(56 líneas)│   │(115 líneas)│     │(214 líneas)│           │
│    └────┬────┘     └────┬────┘        └────┬────┘             │
│         │               │                  │                   │
│    ┌────┴────┐     ┌────┴────┐        ┌────┴────┐             │
│    │node-cd  │     │spring-cd│        │corba-cd │             │
│    │.prod    │     │.prod    │        │.prod    │             │
│    └─────────┘     └─────────┘        └─────────┘             │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │ ionic-ci-cd      │  │ ionic-ci-cd.prod │                    │
│  │ (371 líneas)     │  │ (378 líneas)     │                    │
│  └──────────────────┘  └──────────────────┘                    │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐                            │
│  │  sonarqube   │  │ check-pr-main│                            │
│  └──────────────┘  └──────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
Despliegue en la nube (GCP):
Componente	Servicio GCP	Entorno Dev
Ionic Frontend	Cloud Run	draftkings-dev
Node.js API	Cloud Run	dk-node-dev
Spring Boot (6 MS)	Cloud Run	Cadena: eureka→config→clients
CORBA	Compute Engine VM	dk-corba-dev-vm-tf
Cadena de despliegue Spring Boot:
Eureka Server → Config Server → [Gateway, PlayerMS, ReviewMS, UserMS]
     │                │                    │
     ▼                ▼                    ▼
  (deploy)        (deploy)             (deploy en paralelo)
Docker images en GCP Artifact Registry:
us-east1-docker.pkg.dev/cnsa-2026/draftkings/
├── api-node:latest / :0.0.1
├── client-ionic:latest / :0.0.1
├── eureka-server:latest
├── config-server:latest
├── gateway:latest
├── eureka-client-player:latest
├── eureka-client-review:latest
├── eureka-client-user:latest
└── corba-news-manager:latest
APK Android:
- Dev: assembleDebug (APK debug)
- Prod: assembleRelease + keystore firmado + apksigner verify
Esquema sugerido: Diagrama de tuberías (pipeline) con cada etapa como un bloque, flechas que muestran el flujo, iconos de check/❌ para indicar pass/fail. Mapa de GCP con servicios desplegados.
DIAPOSITIVA 9: SERVICIOS INTELIGENTES Y CORBA
Título: IA y Sistema Distribuido CORBA
Contenido:
Servicio de IA - Equipo Ideal:
┌──────────────────────────────────────────────────────────┐
│                    ENTRADA                                │
│  Mapa de posiciones:                                      │
│  {                                                        │
│    "PO": "Courtois", "DFI": null, "DFC1": "Araújo",     │
│    "DFC2": "Van Dijk", "DFD": "Hakimi", "MC1": "Pedri", │
│    "MC2": null, "MCO": "Messi", "EI": null,              │
│    "ED": "Salah", "DC": "Haaland"                        │
│  }                                                        │
└─────────────────────┬────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────────┐
│              MOTOR DE IA                                  │
│                                                          │
│  Node.js: LangChain + Groq (openai/gpt-oss-120b)        │
│    → PromptTemplate → ChatGroq → StructuredOutputParser  │
│    → Validación con esquema Zod                           │
│                                                          │
│  Spring Boot: Spring AI                                  │
│    → PromptTemplate → ChatModel → BeanOutputConverter    │
│    → DTO TacticRecommendationResponseDTO                 │
└─────────────────────┬────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────────┐
│                    SALIDA                                 │
│  {                                                        │
│    "message": "Analizando tu bloque defensivo...",        │
│    "recommendations": {                                   │
│      "DFI": "Alphonso Davies",                           │
│      "MC2": "Kevin De Bruyne",                           │
│      "EI": "Kylian Mbappé"                               │
│    }                                                      │
│  }                                                        │
└──────────────────────────────────────────────────────────┘
Sistema CORBA - Noticias:
Cadena completa de comunicación:

Frontend (Ionic)
    │ HTTP
    ▼
Spring Gateway
    │ HTTP
    ▼
NewsController (Spring)
    │ HTTP + RestTemplate
    ▼
NewsServiceImpl (Spring) ←── @CircuitBreaker("corbaNews")
    │ HTTP
    ▼
ServletImpl (Java - Puente HTTP↔CORBA)
    │ IIOP (CORBA)
    ▼
ORB Cliente → ORB Servidor
    │
    ▼
BufferImpl (CORBA Server - Java 8)
    │
    ▼
Buffer IDL (5 operaciones):
  - num_elementos()
  - put(elemento)
  - obtener_todas()
  - read_en(indice, out elemento)
  - shutdown()
Circuit Breaker (Resilience4j):
Estado del Circuit Breaker:

CLOSED (normal)  ──fallos──▶  OPEN (bloqueado)  ──tiempo──▶  HALF-OPEN
     ▲                            │                            │
     │                            ▼                            │
     └────────────────── fallback ─────────────────────────────┘

Protecciones implementadas:
├── "corbaNews" → Llamadas al sistema CORBA
│   └── Fallback: distingue entre CallNotPermittedException (503)
│       y errores de validación (4xx)
├── "apiFootball" → Llamadas a API externa
│   └── Fallback: siempre devuelve 503
└── Feign/ReviewMS → Comunicación entre microservicios
    └── Fallback: devuelve listas vacías o null
Esquema sugerido: Diagrama de flujo horizontal para la IA (entrada → motor → salida). Diagrama de cadena de comunicación CORBA con flechas y protocolos etiquetados. Diagrama de estados para el Circuit Breaker.
DIAPOSITIVA 10: TESTING Y CALIDAD
Title: Testing y Garantía de Calidad
Contenido:
Estrategia de testing por componente:
┌─────────────────────────────────────────────────────────────────┐
│                    ESTRATEGIA DE TESTS                          │
│                                                                 │
│  ┌─────────────────────┐  ┌─────────────────────┐              │
│  │      NODE.JS        │  │    SPRING BOOT       │              │
│  │  Jest + Supertest   │  │  JUnit 5 + Mockito   │              │
│  │                     │  │                      │              │
│  │  12 archivos test   │  │  14 archivos test    │              │
│  │  - unit/ (8)        │  │  - unit/ (10+)       │              │
│  │  - integration/ (6) │  │  - integration/      │              │
│  │                     │  │                      │              │
│  │  mongodb-memory-    │  │  H2 Database         │              │
│  │  server (BD en      │  │  (BD en memoria)     │              │
│  │  memoria)           │  │                      │              │
│  └─────────────────────┘  └─────────────────────┘              │
│                                                                 │
│  ┌─────────────────────────────────────────────┐               │
│  │            IONIC / ANGULAR                    │               │
│  │         Cypress (Component + E2E)            │               │
│  │                                              │               │
│  │  20 pruebas de componente (.cy.ts)           │               │
│  │  40 pruebas E2E (cypress/e2e/)              │               │
│  │    - auth.e2e.cy.ts (9 tests)               │               │
│  │    - players.e2e.cy.ts (13 tests)           │               │
│  │    - reviews.e2e.cy.ts (12 tests)           │               │
│  │    - import-players.e2e.cy.ts (5 tests)     │               │
│  │    - tabs.e2e.cy.ts (2 tests)               │               │
│  │                                              │               │
│  │  Multi-navegador: Chrome + Firefox           │               │
│  └─────────────────────────────────────────────┘               │
│                                                                 │
│  ┌─────────────────────┐  ┌─────────────────────┐              │
│  │      CORBA          │  │     SONARQUBE        │              │
│  │  JaCoCo 50-60%      │  │  Análisis estático   │              │
│  │  Checkstyle         │  │  Bugs, Vulns,        │              │
│  │  Maven test         │  │  Code Smells         │              │
│  └─────────────────────┘  └─────────────────────┘              │
└─────────────────────────────────────────────────────────────────┘
Tests E2E de Cypress - Cobertura:
Funcionalidad	Escenarios de éxito	Escenarios de error
Autenticación	Login exitoso, registro con sync	Formulario vacío, email inválido, credenciales rechazadas, rollback
CRUD Jugadores	Crear, ver detalle, editar, eliminar	Validación formularios, permisos por rol, estados vacíos
CRUD Reviews	Crear con geo, editar, eliminar con confirmación	Validación, permisos, errores de red
Importación	Importar desde API externa	Errores de red, selección vacía
Navegación	Tabs, navegación entre páginas	-
Total	 	 
Calidad de código:
Herramienta	Qué verifica	Configuración
ESLint	Code style Angular/TypeScript	strict: true, strictTemplates
Checkstyle	Code style Java	Google Checks
JaCoCo	Cobertura de código	Mínimo 60% (Spring), 50-60% (CORBA)
SonarQube	Análisis estático completo	Bugs, vulnerabilities, code smells
ESLint annotate	Anotaciones en PR	Comentarios automáticos en PRs
Métricas de calidad:
Cobertura de código:
├── Node.js:     ████████████████████░░░░░  ~80% (Jest coverage)
├── Spring Boot: ████████████████░░░░░░░░░  60% mínimo (JaCoCo)
├── CORBA:       ██████████████░░░░░░░░░░░  50-60% (JaCoCo)
└── Ionic:       ████████████████████████░  ~100% componentes (Cypress)

Tests totales:
├── Node.js:     ~60+ tests (unit + integration)
├── Spring Boot: ~50+ tests (unit + integration, matrix de 6 MS)
├── CORBA:       ~10+ tests
├── Ionic:       60 tests (20 component + 40 E2E)
└── Total:       ~180+ tests
Esquema sugerido: Diagrama de testing pirámide (unit en base, integration en medio, E2E en cima). Barras de cobertura con colores. Tabla resumen con iconos de check.
RESUMEN DE ESQUEMAS SUGERIDOS POR DIAPOSITIVA
Diapositiva	Esquema principal
1	Logo central + iconos de tecnología alrededor
2	Diagrama de casos de uso simplificado (4 actores)
3	Diagrama de arquitectura de bloques (capas conectadas)
4	Diagrama ER con entidades y cardinalidades
5	Tabla de endpoints con iconos de método HTTP
6	Árbol de ramas Git + tablero Kanban + timeline de milestones
7	Flujo horizontal de merge con semáforos de checks
8	Diagrama de tuberías (pipeline) + mapa de servicios GCP
9	Diagrama de flujo IA + cadena CORBA + diagrama de estados Circuit Breaker
10	Pirámide de testing + barras de cobertura + tabla resumen

DIAPOSITIVA 11 (EXTRA): PATRONES DE DISEÑO Y DECISIONES ARQUITECTÓNICAS
Título: Patrones de Diseño y Decisiones Clave
Contenido:
Patrón Strategy + Factory - Conmutación de Backends:
Este es el patrón más importante del proyecto. Permite al usuario cambiar entre Node.js y Spring Boot en tiempo de ejecución SIN modificar NINGÚN componente.
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Angular)                           │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              BackendToggleComponent (UI)                  │  │
│  │         ┌──────────┐        ┌──────────────┐             │  │
│  │         │  Node.js │        │ Spring Boot  │             │  │
│  │         │    ●     │        │      ○       │             │  │
│  │         └──────────┘        └──────────────┘             │  │
│  └──────────────────────────┬───────────────────────────────┘  │
│                             │ selectionChange                  │
│                             ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  ConfigService                            │  │
│  │  private _selectedBackend = signal<BackendType>('node')  │  │
│  │  public selectedBackend = _selectedBackend.asReadonly()  │  │
│  │                                                          │  │
│  │  applyBackendChange(newType):                            │  │
│  │    localStorage.setItem(BACKEND_KEY, newType)            │  │
│  │    window.location.reload()  ← Recarga para reinyectar   │  │
│  └──────────────────────────┬───────────────────────────────┘  │
│                             │                                  │
│  ┌──────────────────────────▼───────────────────────────────┐  │
│  │                    FACTORIES (main.ts)                    │  │
│  │                                                          │  │
│  │  { provide: PlayerService,                               │  │
│  │    useFactory: (config) => {                             │  │
│  │      switch(config.selectedBackend()) {                  │  │
│  │        case 'springboot': return new PlayerSpringService │  │
│  │        case 'node':      return new PlayerNodeService    │  │
│  │      }                                                   │  │
│  │    },                                                    │  │
│  │    deps: [ConfigService] }                               │  │
│  └──────────────────────────┬───────────────────────────────┘  │
│                             │                                  │
│  ┌──────────────────────────▼───────────────────────────────┐  │
│  │              CLASES ABSTRACTAS (Strategy)                 │  │
│  │                                                          │  │
│  │  abstract class PlayerService {                          │  │
│  │    abstract getPlayers(): Promise<Player[]>              │  │
│  │    abstract createPlayer(p): Promise<Player>             │  │
│  │    abstract getPlayerById(id): Promise<Player>           │  │
│  │    abstract updatePlayer(id, p): Promise<Player>         │  │
│  │    abstract deletePlayer(id): Promise<void>              │  │
│  │  }                                                       │  │
│  └───────┬──────────────────────────────────┬───────────────┘  │
│          │                                  │                   │
│  ┌───────▼───────────────┐    ┌─────────────▼──────────────┐  │
│  │  PlayerNodeService    │    │  PlayerSpringService        │  │
│  │  extends PlayerService│    │  extends PlayerService      │  │
│  │                       │    │                            │  │
│  │  apiUrl = nodeApiUrl  │    │  apiUrl = springApiUrl     │  │
│  │  + implementaciones   │    │  + implementaciones        │  │
│  │    específicas Node   │    │    específicas Spring      │  │
│  └───────────────────────┘    └────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
Patrón Template Method - AuthService:
┌─────────────────────────────────────────────────────────────────┐
│              AuthService (abstract)                              │
│                                                                 │
│  async login(email, pass):                                      │
│    ┌─────────────────────┐                                      │
│    │ 1. loginFirebase()  │  ← PASO COMÚN (implementado)        │
│    │    (email, pass)    │                                      │
│    └─────────┬───────────┘                                      │
│              │                                                   │
│    ┌─────────▼───────────┐                                      │
│    │ 2. verifyBackend()  │  ← HOOK ABSTRACTO                   │
│    │    (cada backend     │     (Node y Spring implementan      │
│    │     implementa)      │      diferente)                     │
│    └─────────────────────┘                                      │
│                                                                 │
│  async registerFirebase(email, pass):                           │
│    ┌─────────────────────┐                                      │
│    │ 1. registerFirebase │  ← PASO COMÚN                       │
│    └─────────┬───────────┘                                      │
│    ┌─────────▼───────────┐                                      │
│    │ 2. registerBackend  │  ← HOOK ABSTRACTO                   │
│    └─────────┬───────────┘                                      │
│    ┌─────────▼───────────┐                                      │
│    │ 3. sync + profile   │  ← PASO COMÚN                       │
│    └─────────────────────┘                                      │
│                                                                 │
│  abstract verifyBackend(): Promise<void>     ← Cada backend    │
│  abstract registerBackend(data): Promise<any>   lo implementa   │
│  abstract getProfile(): Observable<User>                         │
└─────────────────────────────────────────────────────────────────┘
Patrón Rollback - Compensación automática:
Escenario 1: Registro de usuario
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ registerFirebase│──▶│ registerBackend│──▶│   ÉXITO     │
│  (crear cuenta) │   │  (sync JIT)   │   │              │
└──────────────┘    └───────┬──────┘    └──────────────┘
                            │ FALLA
                            ▼
                    ┌──────────────┐
                    │deleteCurrentUser│ ← ROLLBACK: eliminar
                    │  (Firebase)     │    cuenta de Firebase
                    └──────────────┘

Escenario 2: Crear jugador con imagen
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ uploadImage   │──▶│ createPlayer  │──▶│   ÉXITO     │
│ (Firebase St.)│   │  (Backend)    │   │              │
└──────────────┘    └───────┬──────┘    └──────────────┘
                            │ FALLA
                            ▼
                    ┌──────────────┐
                    │rollbackUpload │ ← ROLLBACK: eliminar
                    │  (Storage)    │    imagen de Storage
                    └──────────────┘
Patrón Circuit Breaker - Estados:
         fallos >= umbral
  CLOSED ────────────────▶ OPEN
    ▲                        │
    │                        │ tiempo de espera
    │                        ▼
    │                     HALF-OPEN
    │                        │
    │  éxito                 │ prueba
    └────────────────────────┘

Implementación:
├── @CircuitBreaker(name = "corbaNews", fallbackMethod = "getAllNewsFallback")
├── @CircuitBreaker(name = "apiFootball", fallbackMethod = "searchExternalPlayersFallback")
└── Feign + Resilience4j para comunicación inter-microservicios
Tabla resumen de patrones:
Patrón	Dónde se aplica
Strategy	Servicios abstractos (Player, Auth, Review, News, Team)
Factory	Funciones en main.ts (playerFactory, authFactory...)
Template Method	AuthService (login/register comunes)
Rollback	PhotoService, AuthService
Circuit Breaker	NewsServiceImpl, ApiFootballServiceImpl, Feign
Observer	Angular Signals (signal, computed, effect)
Interceptor	AuthInterceptor (HTTP)
Esquema sugerido: Diagrama de bloques con flechas de dirección para Strategy/Factory, diagrama de flujo con bifurcación para Rollback, diagrama de estados para Circuit Breaker. Usar colores: verde para éxito, rojo para fallo, amarillo para rollback/half-open.
