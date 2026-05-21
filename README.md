# DraftKings ⚽

![Logo](./client-ionic/src/assets/icon/DK-logo-text.png)
## 📝 Introducción
**DraftKings** es una aplicación móvil híbrida diseñada para los apasionados del fútbol. La plataforma permite a los usuarios gestionar una base de datos de jugadores, realizar un seguimiento de noticias detalladas, calificar el rendimiento mediante comentarios y valoraciones, y diseñar tácticamente su "Equipo Ideal". 

Esta aplicación combina una interfaz moderna y fluida con varias arquitecturas de backend robustas y distribuida, garantizando escalabilidad, independencia entre los diferentes modulos de la aplicación y eficiencia en la gestión de datos deportivos.

---

## 🚀 Características Principales

- **Gestión de Jugadores:** Visualización, búsqueda con filtros avanzados y creación de nuevos perfiles con integración de cámara y geolocalización.
- **Interacción Social:** Sistema de comentarios y valoraciones (0-5 estrellas) para cada jugador.
- **Módulo de Noticias:** Creación y lectura de noticias vinculadas a jugadores específicos con soporte para etiquetas y resúmenes.
- **Equipo Ideal:** Herramienta interactiva para que el usuario configure su propia alineación táctica.
- **Personalización:** Soporte multi-idioma y modo claro/oscuro.

---

## 🛠️ Tecnologías Utilizadas

El proyecto utiliza un stack tecnológico avanzado para soportar una arquitectura híbrida y distribuida:

### **Frontend**
- **Angular** El proyecto se forma de Standalone components
- **Ionic Framework:** Desarrollo de la aplicación híbrida para garantizar una experiencia nativa en iOS y Android.
- **Capacitor:** Para el acceso a hardware nativo (Cámara y GPS).
- **Componentes UI:** Diseño basado en componentes deportivos de alto rendimiento.

### **Backend (Microservicios / Servicios Distribuidos)**
- **Node.js:** Encargado de [mencionar función, ej: la lógica de noticias y tiempo real].
- **Spring Boot (Java):** Encargado de [mencionar función, ej: la gestión robusta de jugadores y autenticación].
- **Mencionar diagramas**

### **Comunicación y Persistencia**
- **CORBA (Common Object Request Broker Architecture):** Utilizado como middleware para la interoperabilidad entre objetos distribuidos en una red heterogénea.
- **ORB (Object Request Broker):** Facilitador de la comunicación entre los servicios de backend y el almacenamiento de datos.

---

## 🏗️ Arquitectura del Sistema

La aplicación sigue un modelo de arquitectura distribuida donde:
1. El **Frontend (Ionic)** se comunica con las APIs REST de Node.js y Spring Boot.
2. La capa de servicios utiliza **CORBA** para la comunicación entre componentes críticos del servidor, permitiendo que diferentes lenguajes y plataformas interactúen de forma transparente.



### 🔧 Arquitectura de Microservicios Spring Boot

El backend de Spring Boot implementa una arquitectura de microservicios distribuidos con los siguientes componentes y patrones:

#### **1. Eureka Server (Service Discovery)**

**Función:** Descubrimiento y registro dinámico de servicios.

- **Responsabilidades:**
  - Todos los microservicios se registran automáticamente en Eureka al iniciar
  - Mantiene un registro actualizado de instancias disponibles
  - Permite que los servicios se descubran entre sí mediante el nombre lógico
  - Implementa health checks para detectar servicios caídos

- **Configuración:**
  - Escucha en puerto estándar (por defecto 8761)
  - Replicas pueden crearse para alta disponibilidad
  - Los clientes consultan periódicamente (cada 30 segundos) el estado de servicios

#### **2. Config Server (Gestión Centralizada de Configuración)**

**Función:** Proporciona configuración externalizada y dinámica para todos los microservicios.

- **Responsabilidades:**
  - Almacena propiedades (application.yaml) de cada microservicio en este mismo repositorio GitHub (config.storage)
  - Permite cambios de configuración sin redeploying
  - Cada servicio obtiene su configuración específica al arrancar
  - **Comportamiento:** Si está caído, los servicios siguen funcionando con su última configuración conocida

- **Archivos de configuración:**
  - `config-storage/<ms>-dev.yaml` → Configuración del microservico con perfil de desarollo en el despliegue
  - `config-storage/<ms>-prod.yaml` → Configuración del microservico con perfil de producción en el despliegue
  - `config-storage/<ms>.yaml` → Configuración del microservico por defecto

#### **3. API Gateway (Enrutamiento de Peticiones)**

**Función:** Punto de entrada único y orquestador de tráfico.

- **Responsabilidades:**
  - Recibe TODAS las peticiones del cliente (Frontend Ionic)
  - Redirige dinámicamente a los microservicios correspondientes basándose en rutas configuradas
  - Implementa load balancing usando Eureka para saber dónde está cada servicio
  - Maneja autenticación y autorización (JWT)
  - Rate limiting y validación de peticiones
  - Agrupa respuestas de múltiples servicios cuando es necesario

- **Patrones:**
  - **TO DO**
  - El Gateway conoce la ubicación de cada servicio consultando Eureka

#### **4. Player Microservice (Gestión de Jugadores)**

**Función:** Responsable de toda la lógica relacionada con jugadores.

- **Responsabilidades:**
  - CRUD completo de jugadores (Create, Read, Update, Delete)
  - Filtros avanzados (por posición, equipo, rendimiento, etc.)
  - Gestión de datos deportivos (estadísticas, goles, asistencias)
  - **Control de comentarios en jugadores:** Relación 1:N con tabla `comments` se encarga de la comunicación con el micorservicio de reseñas y gestiona sus comentarios dado un jugador(comentarios específicos de jugadores)
  - Cálculo de promedios de valoraciones para jugadores
  - Conexión directa a Base de Datos SQL (tabla: `players`)

- **Dependencias:**
  - ✅ Se conecta a **Eureka** para registrarse
  - ✅ Se conecta a **Config Server** para obtener conexión a BD
  - ✅ Se comunica con **Review MS** (cuando necesita datos de reseñas de un jugador)

#### **5. Review Microservice (Sistema de Reseñas y Valoraciones)**

**Función:** Gestiona reseñas generales, valoraciones y comentarios independientes del contexto de jugadores.

- **Responsabilidades:**
  - CRUD de valoraciones generales (0-5 estrellas)
  - Gestión de reseñas y comentarios independientes
  - Calcular promedio de valoraciones
  - Ordenar por más recientes, mejor valoradas, etc.
  - Conexión directa a Base de Datos SQL (tabla: `reviews`)

- **Dependencias:**
  - ✅ Se conecta a **Eureka** para registrarse
  - ✅ Se conecta a **Config Server** para obtener conexión a BD
  - ✅ Se comunica con **Player MS** (para validar contextos de jugadores si aplica)

---

## 🔄 Flujo de Comunicación entre Microservicios

### **Ejemplo: Usuario solicita ver "Equipo Ideal" con detalles**

**TO-DO** Refinar rutas

```
1. Frontend (Ionic) → Gateway
   GET /api/gateway:8080/player/id/123/comentarios/234

2. Gateway → Eureka
   "¿Dónde está Player MS?"
   Respuesta: 192.168.1.5:8090

3. Gateway → Player MS
   GET /player/id/123/comentarios/234
   Respuesta: Jugador Identificado

4. Player MS → Eureka
   "¿Dónde está Review MS?"
   Respuesta: 192.168.1.7:8091

5. Player MS → Review MS (via Feign)
   GET /comentarios/234 (Comentario del jugador)
   Respuesta: Datos detallados del comentario del jugador

6. Player MS → Frontend (vía Gateway)
   Respuesta completa: Comentario de un jugador específico
```

### **Ventajas de esta Arquitectura:**

| Aspecto | Beneficio |
|--------|-----------|
| **Escalabilidad** | Cada MS escala independientemente según demanda |
| **Resiliencia** | Si Review MS cae, Player MS sigue funcionando |
| **Independencia** | Equipos pueden trabajar en paralelo sin conflictos |
| **Mantenibilidad** | Cambios en un servicio no afectan a otros |
| **Desacoplamiento** | Comunicación vía APIs REST, no compartición de BD |
| **Configuración Centralizada** | Cambios sin redeploy gracias a Config Server |
| **Discovery Automático** | Eureka maneja el registro/desregistro dinámicamente |

---

## 🏗️ Arquitectura del Sistema

## � Pipeline CI/CD

La arquitectura de integración y despliegue continuo está diseñada para garantizar calidad, seguridad y automatización en cada sección del proyecto. A continuación, se describe en detalle el flujo para cada componente:

### **1️⃣ Frontend Ionic (CI/CD)**

**Archivo:** `ionic-ci-cd.yaml` y `ionic-ci-cd.prod.yml`

**Triggers:**
- ✅ Se ejecuta en `push` a `main` y `dev`
- ✅ Se ejecuta en `pull_request` a `main` y `dev`

**Flujo de Integración Continua (CI):**

1. **Setup Node.js (v24)**
   - Instala dependencias usando npm con caché para optimizar build
   
2. **Linting & Code Quality**
   - Ejecuta `npm run lint:json` para generar reporte de ESLint
   - Genera archivo `eslint-result.json` para análisis de PR
   
3. **Build Web**
   - **Dev:** `npx ionic build` (sin optimizaciones)
   - **Prod:** `npx ionic build --prod` (optimizado para producción)
   - Genera carpeta `www/` con assets compilados
   
4. **Build Android APK**
   - Setup de Java (v21) y Android SDK (API 34)
   - Adiciona plataforma Android via Capacitor
   - Sincroniza Capacitor: `npx cap sync android`
   - **Dev:** Genera APK en modo Debug (`app-debug.apk`)
   - **Prod:** Genera APK en modo Release y lo firma digitalmente con keystore
   
5. **E2E & Component Tests (solo Prod)**
   - Ejecuta Cypress con matriz de navegadores: Chrome y Firefox
   - Valida funcionalidad de componentes críticos

6. **Artefactos Generados:**
   - `www/` - Build web compilado
   - `DraftKings-debug.apk` o `DraftKings.apk` - APK firmado
   - `eslint-report` - Reporte de linting

---

### **2️⃣ Backend Node.js (CI/CD)**

**Archivo:** `node-ci.yaml`, `node-cd.yaml` y `node-cd.prod.yml`

**Triggers:**
- ✅ Se ejecuta en `push` a `main` y `dev`
- ✅ Se ejecuta en `pull_request` a `main` y `dev`

**Flujo de Integración Continua (CI):**

1. **Setup Node.js (v24)**
   - Instala dependencias con npm caché
   - Working directory: `./api-node`
   
2. **Build TypeScript**
   - Ejecuta `npm run build`
   - Transpila TS → JS a carpeta `dist/`
   
3. **Code Quality**
   - Genera reporte ESLint: `npm run lint:json`
   - Anotaciones en PR con resultados de linting

4. **Testing con Jest**
   - Ejecuta `npm run coverage`
   - Genera: `junit.xml` y reportes de cobertura
   - Integración con test-reporter de GitHub

5. **Artefactos:**
   - `dist/` - Código compilado
   - `public/` - Assets estáticos
   - `junit.xml` - Resultados de tests
   - `coverage/` - Reporte de cobertura

**Flujo de Despliegue Continuo (CD):**

**Deployment a Dev** (`node-cd.yaml`):
- Trigger: Se ejecuta si CI es exitoso en rama `dev`
- Steps:
  1. Descarga artefactos del build (dist/)
  2. Autentica en Google Cloud usando `GCP_SA_KEY`
  3. Crea/actualiza secret en GCP: `NODE_ENV_DEV`
  4. Login a Artifact Registry
  5. **Build Docker:** Usa `Dockerfile` estándar
     ```dockerfile
     docker build -t us-east1-docker.pkg.dev/cnsa-2026/draftkings/api-node:latest .
     ```
  6. Push a Artifact Registry
  7. **Deploy a Cloud Run:** 
     - Service: `dk-node-dev`
     - Region: `us-east1`
     - Inyecta secreto: `/app/enviroments/env=NODE_ENV_DEV:latest`
     - Flag: `--allow-unauthenticated`

**Deployment a Prod** (`node-cd.prod.yml`):
- Trigger: Se ejecuta si CI es exitoso en rama `main`
- Steps: Similares a Dev, con diferencias:
  - Build Docker con tag versionado: `:0.0.1`
  - Usa `Dockerfile.prod` optimizado
  - Service: `dk-node` (sin sufijo -dev)
  - Secret: `NODE_ENV_PROD`

---

### **3️⃣ Backend Spring Boot (CI/CD)**

**Archivo:** `spring-ci.yaml`, `spring-cd.yml` y `spring-cd.prod.yml`

**Triggers:**
- ✅ Se ejecuta en `push` a `main` y `dev`
- ✅ Se ejecuta en `pull_request` a `main` y `dev`

**Microservicios Incluidos (Matrix Strategy):**
```
1. eureka.server              → Servidor de descubrimiento de servicios
2. config.server              → Servidor centralizado de configuración
3. gateway                    → API Gateway para enrutamiento
4. eureka.client.player       → Microservicio de Jugadores (con DB)
5. eureka.client.review       → Microservicio de Reseñas (con DB)
```

**Flujo de Integración Continua (CI):**

1. **Setup Java 17** (Temurin)
   - Caché de Maven para optimizar builds

2. **Build Paralelo (Matrix Strategy)**
   - Cada microservicio se compila en paralelo
   - Si un servicio falla, los demás continúan (`fail-fast: false`)
   - Working directory: `./api-spring/${{ matrix.service }}`

3. **Maven Build Completo** por servicio:
   ```bash
   mvn -B clean package
   ```
   - Clean: Limpia builds anteriores
   - Package: Compila, prueba y genera JAR

4. **Code Quality & Coverage:**
   - **JaCoCo Coverage:** Análisis de cobertura de código (mínimo 60%)
   - **Checkstyle:** Validación de estilo (Google Checks)
   - Comentarios automáticos en PRs con resultados

5. **Test Results:**
   - Genera: `target/surefire-reports/*.xml`
   - Reporter de dorny/test-reporter para visualizar en GitHub

6. **Artefactos Generados:**
   - `${{ service }}-jar` - JAR ejecutable
   - `${{ service }}-test-results` - Resultados de tests

**Flujo de Despliegue Continuo (CD):**

El deployment es **manual y parametrizado** usando `workflow_call`:

```yaml
on:
  workflow_call:
    inputs:
      service_name:
        required: true
        type: string
```

**Steps de Deployment (Dev y Prod tienen la misma lógica):**

1. Descarga JAR del servicio especificado
2. Autentica en GCP
3. Transforma nombre del servicio:
   - `eureka.client.player` → `eureka-client-player`
4. Crea/actualiza secretos en GCP (si aplica):
   - Player y Review usan `DB_SQL_PASS_DEV` o `DB_SQL_PASS_PROD`
5. **Build Docker:**
   ```bash
   docker build -t us-east1-docker.pkg.dev/cnsa-2026/draftkings/${{ service_slug }}:latest .
   ```
6. Push a Artifact Registry
7. **Deploy a Cloud Run:**
   - Service: `${{ service_slug }}-dev` (o sin -dev en prod)
   - Inyecta secretos de DB solo si aplica
   - Flags: `--allow-unauthenticated --ingress=all`

**Diferencias Dev/Prod:**
- **Dev:** Tag `:latest`, secret `_DEV`
- **Prod:** Tag `:0.0.1`, secret `_PROD`, Dockerfile.prod

---

### **4️⃣ CORBA Services (CI/CD)**

**Archivo:** `corba-ci.yaml`, `corba-cd.yml` y `corba-cd.prod.yml`

**Triggers:**
- ✅ Se ejecuta en `push` a `main` y `dev`
- ✅ Se ejecuta en `pull_request` a `main` y `dev`

**Particularidad:** Java 8 (CORBA fue removido de Java 11+)

**Flujo de Integración Continua (CI):**

1. **Setup Java 8** (Temurin - CRÍTICO para CORBA)
   - CORBA no está disponible en Java 11+
   - El compilador `idlj` es parte del JDK 8

2. **Verificación del Compilador IDL:**
   - Verifica disponibilidad de `idlj` (IDL Java Compiler)
   - Invocado automáticamente por Maven en fase `generate-sources`

3. **Maven Build:**
   ```bash
   mvn -B clean verify
   ```
   - **generate-sources:** Ejecuta `idlj` para compilar archivos `.idl`
   - **compile:** Compila código Java generado + código fuente
   - **test:** Ejecuta tests con JUnit 5
   - Genera JAR con dependencias: `*-jar-with-dependencies.jar`

4. **Code Quality:**
   - **JaCoCo Coverage:** Mínimo 60%
   - **Checkstyle:** Validación de estilo Google

5. **Test Results:**
   - Reporte JUnit con dorny/test-reporter

6. **Artefactos:**
   - `corba-jar` - JAR ejecutable con dependencias
   - `test-results` - Reportes JUnit

**Flujo de Despliegue Continuo (CD):**

El deployment de CORBA es **más complejo** que otros servicios debido a infraestructura on-premise:

**Steps de Deployment (Dev):**

1. **Docker Setup:**
   - Build imagen: `docker build -t us-east1-docker.pkg.dev/cnsa-2026/draftkings/corba-news-manager:latest .`
   - Push a Artifact Registry

2. **Resiliencia & VM Management:**
   - Verifica estado de VM en GCP:
     - Si está `TERMINATED` → La enciende
     - Si está `RUNNING` → Continúa
     - Si `NOT_FOUND` → Lanza Terraform para crearla

3. **SSH Key Management:**
   - Instala clave privada SSH desde secrets
   - Escanea fingerprints del host

4. **Infrastructure as Code (Terraform)** [SOLO SI VM NO EXISTE]:
   - Setup Terraform
   - Crea credenciales GCP y llaves SSH
   - Inicia workspace: `$ENTORNO=dev`
   - Aplica configuración:
     ```bash
     terraform init -backend-config="prefix=terraform/state/$ENTORNO"
     terraform apply -auto-approve
     ```
   - Genera VM con permisos SSH habilitados

5. **Espera VM lista:**
   - Retry up to 15 veces para SSH conectado
   - Espera 10 segundos entre intentos

6. **Despliegue en VM via SSH:**
   - Conecta a VM mediante SSH
   - Pull imagen Docker
   - Inicia contenedor CORBA
   - Configura puerto de escucha

**Deployment a Prod** (`corba-cd.prod.yml`):
- VM: `dk-corba` (sin sufijo -dev)
- DNS: `dk-corba.cnsa-2026-dsa069.tech`
- Imagen: Tag `:0.0.1`
- Usa `Dockerfile.prod`

---

## 📱 Flujo de Pantallas y Componentes

### 1. Autenticación (Sin Tab Bar)
- **Vista Login:** Formulario de acceso con logo, campos de email/password y botón de acción. Enlace a registro.
- **Vista Registro:** Formulario extendido para nuevos usuarios.

### 2. Gestión de Jugadores (Tab: Jugadores)
- **Lista de Jugadores:** 
    - Barra de búsqueda superior.
    - Botón de filtros de búsqueda.
    - Listado de tarjetas (cards) de jugadores.

- **Crear Jugador:**
    - Formulario: Nombre, posición, dorsal.
    - Sección de imagen: Botón para "Tomar Foto" y placeholder de previsualización.
    - Sección de Mapa: Componente de mapa interactivo para marcar ubicación.

- **Ver Jugador:**
    - Cabecera con imagen grande y datos estadísticos.
    - **Sección de Comentarios:** Lista de comentarios que incluya: Autor, texto del comentario y sistema de valoración visual (0 a 5 estrellas).

### 3. Sistema de Noticias
- **Crear Noticias:** Formulario con campos: Encabezado, Resumen, Descripción larga, Autor, Fecha (selector),Jugador relacionado y Tags (etiquetas).
- **Ver Noticias:** Layout de lectura con jerarquía clara entre encabezado y cuerpo de la noticia, mostrando tags y jugador asociado.

### 4. Estrategia (Tab: Equipo Ideal)
- **Vista Equipo Ideal:** 
    - Representación visual de un campo de fútbol o lista táctica.
    - Interfaz para seleccionar y posicionar jugadores existentes en el once inicial.

### 5. Configuración (Tab: Ajustes)
- **Sección Perfil:** Tarjeta de usuario con foto circular, visualización de correo y opción de cambiar contraseña.
- **Sección Ajustes de App:** 
    - Switch/Toggle para cambio de Idioma Español/Ingles.
    - Switch/Toggle para Modo Claro / Modo Oscuro.

---
## 🏭 Implementación Patrones Factory/Strategy

Para garantizar la escalabilidad y permitir que la aplicación conmute entre diferentes orígenes de datos (Backend en **Node.js** o **Spring Boot**), se ha implementado una arquitectura desacoplada basada en patrones de diseño clásicos y reactividad moderna.

### Arquitectura de Capas

El flujo de datos sigue una jerarquía estricta para asegurar el principio de responsabilidad única:

1.  **Vistas (Pages/Components):** Consumen el servicio a través de una **clase abstracta**. No conocen si los datos vienen de Node o Spring.
2.  **ConfigService:** Es la "fuente de verdad". Gestiona la preferencia del usuario mediante **Signals** de Angular y persiste la elección en `localStorage`.
3.  **Factories:** Funciones puras encargadas de la instanciación. Deciden qué implementación crear basándose en el estado del `ConfigService`.
4.  **Clase Abstracta (Contrato):** Define la estructura de los métodos (CRUD) y centraliza la lógica común, utilizando la función `inject()` para la gestión de dependencias.
5.  **Implementaciones (Estrategias):** Clases específicas que heredan de la abstracta y definen detalles particulares como la `apiUrl`.



### Flujo de Ejecución

El proceso de cambio de backend se realiza de forma atómica para mantener la integridad de los datos:

* **Selección:** El usuario elige el backend en el `BackendToggleComponent` (dentro de Login o Registro).
* **Confirmación:** Al pulsar el botón de acción (Login/Register), se invoca al `ConfigService`.
* **Persistencia y Reset:** Si el backend ha cambiado, el servicio guarda la nueva configuración y dispara un `window.location.reload()`.
* **Inyección Dinámica:** Al reiniciar la app, el motor de **Inyección de Dependencias** de Angular ejecuta la **Factory** en el `main.ts`, la cual provee la implementación correcta a toda la aplicación.

---

## 🔐 Sistema de Autenticación

El sistema de autenticación implementa un flujo completo que utiliza **Firebase Authentication** como proveedor de identidad común, combinado con middleware específico en Node.js y Spring Boot para sincronizar usuarios en bases de datos locales. Este diseño garantiza seguridad, escalabilidad y la capacidad de cambiar entre backends transparentemente.

### 🎯 Arquitectura General

```
┌──────────────────────────────────────────────────────────────┐
│                    CLIENTE (Ionic/Angular)                  │
│  - LoginPage / SignUpPage (formularios de auth)              │
│  - AuthService (abstracta, patrón Strategy)                  │
│  - AuthInterceptor (adjunta JWT a peticiones HTTP)           │
└─────────────────────────────────┬──────────────────────────────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │   Firebase Authentication  │
                    │  (Valida email/password)   │
                    │   Genera JWT (ID Token)    │
                    └─────────────┬──────────────┘
                                  │
         ┌────────────────────────┴────────────────────────┐
         │                                                  │
    ┌────▼─────────────┐                          ┌────────▼────────┐
    │   NODE.JS API    │                          │  SPRING BOOT MS │
    ├────────────────┤                          ├─────────────────┤
    │ Middleware:    │                          │ Spring Security:│
    │ - Valida JWT   │                          │ - Valida JWT    │
    │ - Crea usuario │                          │ - Extrae claims │
    │   automático   │                          │     │
    ├────────────────┤                          ├─────────────────┤
    │ MongoDB        │                          │ PostgreSQL      │
    │ (Users)        │                          │ (Users)         │
    └────────────────┘                          └─────────────────┘
```

**Características clave:**

- **Firebase como proveedor:** Autentica credenciales y genera JWT
- **Sincronización JIT (Just-In-Time):** Node.js crea usuarios automáticamente en primer acceso
- **Vinculación por UID:** El Firebase UID es la clave primaria de referencia en ambas BDs
- **Interceptor HTTP:** Adjunta JWT a todas las peticiones automáticamente
- **CORS configurado:** Permite peticiones desde cliente Ionic

---

### 📝 Flujo de Registro (Sign Up)

```
1. Usuario completa formulario:
   ├─ userName (nombre de usuario)
   ├─ email
   ├─ password (validado: 8 chars, 1 número, 1 símbolo)
   └─ confirmPassword (debe coincidir)

2. SignUpPage.onRegister() inicia:
   ├─ Bloquea centinela temporalmente: localStorage['bypass_centinela'] = 'true'
   └─ Evita interferencias mientras se registra

3. AuthService.registerFirebase(email, password):
   ├─ Firebase.createUserWithEmailAndPassword()
   ├─ Valida credenciales
   ├─ ✅ Si exitoso: Crea usuario en Firebase, genera JWT
   └─ ❌ Si falla: Lanza excepción (email duplicado, etc.)

4. AuthService.registerBackend({ userName }):
   ├─ POST /api/user/sync (Node) o /userms/api/auth/sync-user (Spring)
   ├─ AuthInterceptor agrega: Authorization: Bearer {JWT}
   │
   ├─── EN NODE.JS ───────────────────────────────────────┐
   │    a) Middleware authorizeRequest:                   │
   │       ├─ Decodifica JWT (Firebase Admin SDK)         │
   │       ├─ Extrae: firebaseUid, email, name            │
   │       ├─ Busca usuario en MongoDB                    │
   │       ├─ SI NO EXISTE → Crea automáticamente         │
   │       │  Campos: firebaseUid, email, userName,       │
   │       │          role, is_active, blocked            │
   │       └─ SI EXISTE → Usa documento existente         │
   │    b) syncUser controller:                           │
   │       ├─ Actualiza userName si se proporciona        │
   │       ├─ FindByIdAndUpdate en MongoDB                │
   │       └─ Devuelve 200 OK + usuario actualizado       │
   │                                                       │
   ├─── EN SPRING BOOT ────────────────────────────────────┤
   │    a) Spring Security valida JWT:                    │
   │       ├─ Decodifica contra clave pública Firebase    │
   │       ├─ Verifica expiración                         │
   │       ├─ Crea @AuthenticationPrincipal Jwt           │
   │       └─ Extrae claims (sub=firebaseUid, email)      │
   │    b) AuthController.syncUserToPostgres():           │
   │       ├─ Busca usuario en PostgreSQL                 │
   │       ├─ SI NO EXISTE → Crea con JPA:               │
   │       │  Campos: firebaseUid, email, userName, role  │
   │       │  save() a base de datos                      │
   │       ├─ SI EXISTE → Devuelve 400 (ya sincronizado)  │
   │       └─ Devuelve 200 OK + mensaje                   │
   └────────────────────────────────────────────────────┘

5. Si TODO es exitoso (200 OK en backend):
   ├─ Limpia localStorage:
   │  ├─ pending_sync_data
   │  ├─ execute_sync_on_reload
   │  └─ bypass_centinela
   ├─ showToast('Registration successful!')
   └─ navCtrl.navigateRoot('/tabs/players') ✅

6. Si FALLA en backend (error en sync):
   ├─ authService.deleteCurrentUser() → ROLLBACK Firebase
   ├─ Limpia localStorage
   ├─ showToast('Registration failed, please try again.')
   └─ navCtrl.navigateRoot('/sign-up') (vuelve al formulario)
```

**Importancia del Rollback:** Garantiza que si el backend falla, el usuario NO queda registrado en Firebase. Integridad bidireccional.

---

### 🔑 Flujo de Login

```
1. Usuario introduce:
   ├─ email
   └─ password

2. LoginPage.onLogin() inicia:
   ├─ Verifica si cambió backend desde localStorage
   └─ Si cambió → window.location.reload() (el AppComponent termina el trabajo)

3. AuthService.loginFirebase(email, password):
   ├─ Firebase.signInWithEmailAndPassword()
   ├─ ✅ Exitoso: Genera JWT para la sesión
   └─ ❌ Falla: Credenciales inválidas (excepción)

4. AuthService.verifyBackend():
   ├─ GET /api/user/profile (Node) o /userms/api/auth/me (Spring)
   ├─ AuthInterceptor agrega: Authorization: Bearer {JWT}
   │
   ├─── EN NODE.JS ───────────────────────────────────────┐
   │    a) Middleware authorizeRequestNoCreate:           │
   │       ├─ Decodifica JWT (Firebase Admin SDK)         │
   │       ├─ Extrae firebaseUid                          │
   │       ├─ Busca usuario en MongoDB                    │
   │       ├─ SI NO EXISTE → 401 Unauthorized (logout)    │
   │       ├─ SI EXISTE PERO bloqueado/inactivo → 401     │
   │       └─ SI EXISTE Y activo → req.user = documento   │
   │    b) Retorna perfil del usuario (200 OK)            │
   │                                                       │
   ├─── EN SPRING BOOT ────────────────────────────────────┤
   │    a) Spring Security valida JWT                     │
   │    b) AuthController.getMyProfile():                 │
   │       ├─ Extrae firebaseUid del JWT                  │
   │       ├─ findByFirebaseUid(firebaseUid)              │
   │       ├─ SI EXISTE → 200 OK + User entity            │
   │       └─ SI NO EXISTE → 404 Not Found (logout)       │
   └────────────────────────────────────────────────────┘

5. Si verifyBackend() devuelve 200:
   ├─ showToast('Login successful!', 'success')
   └─ navCtrl.navigateRoot('/tabs/players') ✅

6. Si verifyBackend() falla (401/404):
   ├─ authService.logout() → Cierra sesión Firebase
   ├─ Limpia localStorage
   ├─ showToast('Login failed. Please check your credentials.')
   └─ navCtrl.navigateRoot('/login') (vuelve al formulario)
```

**Diferencia clave:** En login, el backend NO crea usuarios. Solo valida que existan. Esto previene que usuarios no registrados accedan.

---

### 🛡️ Backend Node.js - Middleware de Autenticación

[Ver archivo completo](api-node/draftKings_api/middleware/auth.middleware.ts)

#### **Middleware `authorizeRequest` (Crea usuario si no existe)**

Usado en: `POST /api/user/sync` (endpoint de sincronización)

```typescript
// Flujo paso a paso:
1. Extrae token de header Authorization: Bearer {JWT}
2. Valida con Firebase Admin SDK:
   ├─ admin.auth().verifyIdToken(token)
   ├─ Decodifica JWT
   ├─ Verifica firma (clave pública Firebase)
   └─ Obtiene decoded: { uid, email, name, ... }

3. Busca usuario en MongoDB:
   ├─ User.findOne({ firebaseUid: uid, is_active: true, blocked: false })
   │
   ├─ SI EXISTE:
   │  └─ req.user = documento (continúa)
   │
   └─ SI NO EXISTE (Primer registro):
      ├─ Crea nuevo documento:
      │  {
      │    firebaseUid: uid,
      │    email: decoded.email,
      │    userName: req.body.userName || null,
      │    role: 'usuario',
      │    is_active: true,
      │    blocked: false,
      │    createdAt: Date.now()
      │  }
      ├─ Guarda en MongoDB
      └─ req.user = documento creado (continúa)

4. next() → Continúa a controlador
```

**Ventaja:** Just-In-Time Provisioning. El usuario se crea automáticamente en primer acceso.

#### **Middleware `authorizeRequestNoCreate` (Solo valida)**

Usado en: `GET /api/user/profile` (obtener perfil)

```typescript
1. Mismos pasos 1-2 (extrae y valida JWT)

2. Busca usuario en MongoDB (sin crear):
   ├─ SI EXISTE Y está activo:
   │  ├─ req.user = documento
   │  └─ next() (continúa)
   │
   └─ SI NO EXISTE O está inactivo/bloqueado:
      ├─ res.status(401).json({ error: 'No autorizado' })
      └─ Detiene ejecución (no llama next())
```

#### **Modelo de Usuario en MongoDB**

[user.ts](api-node/draftKings_api/models/user.ts)

```typescript
{
  firebaseUid: String (unique, required)  ← Clave de vinculación con Firebase
  email: String (unique, required)
  userName: String (opcional)
  role: String (default: 'usuario')
  is_active: Boolean (default: true)
  blocked: Boolean (default: false)
  timestamps: true  ← createdAt, updatedAt automáticos
}
```

#### **Rutas**

[user.ts](api-node/draftKings_api/routes/user.ts)

```typescript
POST /api/user/sync
  ├─ Middleware: authorizeRequest (CREA si no existe)
  ├─ Controller: syncUser
  └─ Actualiza userName si se proporciona en body

GET /api/user/profile
  ├─ Middleware: authorizeRequestNoCreate (NO crea)
  ├─ Retorna: req.user directamente
  └─ 401 si usuario no existe o está inactivo
```

---

### 🏗️ Backend Spring Boot - Autenticación con OAuth2/JWT

[Configuración de Seguridad](api-spring/eureka.client.user/src/main/java/draftkings/eureka/client/user/config/SecurityConfig.java)

#### **SecurityConfig - Configuración de Seguridad**

Cors diseñado apra permitir solo conexiones específicas

#### **Flujo de Validación JWT en Spring Security**

```
Petición HTTP llega al gateway/microservicio:
  │
  ├─ Authorization: Bearer {JWT}
  │
  ▼
Spring Security Filter Chain:
  │
  ├─ 1. CORS Filter: Valida origen (si es preflight, responde 200)
  │
  ├─ 2. OAuth2 Resource Server Filter:
  │    ├─ Extrae JWT del header
  │    ├─ BearerTokenAuthenticationFilter decodifica
  │    │
  │    ├─ JwtDecoder valida firma:
  │    │  ├─ Obtiene clave pública desde:
  │    │  │  issuer-uri: https://securetoken.google.com/draftkings-a26c3
  │    │  ├─ Verifica firma HMAC/RSA
  │    │  ├─ Valida expiración (exp claim)
  │    │  └─ Valida audience (aud claim, si aplica)
  │    │
  │    ├─ Si VÁLIDO:
  │    │  ├─ Crea Jwt object (decoded JWT)
  │    │  ├─ JwtAuthenticationConverter extrae claims:
  │    │  │  ├─ sub (Firebase UID) → nombre principal
  │    │  │  ├─ email
  │    │  │  ├─ name
  │    │  │  └─ otros claims custom
  │    │  ├─ Crea Authentication con roles/authorities
  │    │  └─ SecurityContext.setAuthentication(auth)
  │    │
  │    └─ Si INVÁLIDO:
  │       ├─ JwtException (token expirado, firma inválida, etc.)
  │       └─ 401 Unauthorized
  │
  ├─ 3. AuthorizationFilter:
  │    ├─ Verifica si ruta requiere autenticación
  │    ├─ SI REQUIERE y no hay Authentication → 403 Forbidden
  │    └─ SI REQUIERE y hay Authentication → Continúa
  │
  ▼
  Controlador recibe @AuthenticationPrincipal Jwt jwt
```

#### **AuthController - Endpoints de Autenticación**

[AuthController.java](api-spring/eureka.client.user/src/main/java/draftkings/eureka/client/user/controller/AuthController.java)


#### **Modelo de Usuario en PostgreSQL**

```java
@Entity
@Table(name = "users")
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;  // PK auto-incremental
    
    @Column(unique = true, nullable = false)
    private String firebaseUid;  // ← Clave de vinculación con Firebase
    
    @Column(nullable = false)
    private String email;
    
    private String userName;
    
    private String role;
    
    // Getters y setters...
}
```

#### **Configuración YAML (spring.mvc.cors y OAuth2)**

[userMS-prod.yaml](api-spring/config-storage/userMS-prod.yaml)

```yaml
spring:
  mvc:
    cors:
      configs:
        '[/**]':
          allowed-origins: "https://draftkings.cnsa-2026-dsa069.tech"
          allowed-methods: "*"
          allowed-headers: "*"
          allow-credentials: true
  
  security:
    oauth2:
      resourceserver:
        jwt:
          # Firebase proporciona la clave pública en este endpoint
          issuer-uri: https://securetoken.google.com/draftkings-a26c3
```

---

### 🔗 Sincronización de Usuarios - Vinculación con Firebase UID

La clave del sistema es usar **Firebase UID como identificador único** en ambas bases de datos:

#### **En Node.js (MongoDB)**
```typescript
User {
  firebaseUid: "abc123xyz..." (unique, required)  ← Mismo UID de Firebase
  email: "user@example.com"
  userName: "juan_perez"
  role: "usuario"
}
```

#### **En Spring Boot (PostgreSQL)**
```java
User {
  id: 1 (PK, auto-incremental)
  firebaseUid: "abc123xyz..." (unique, required)  ← Mismo UID de Firebase
  email: "user@example.com"
  userName: "juan_perez"
  role: "ROLE_USER"
}
```

**Ventajas:**
- ✅ Mismo usuario en ambas BDs sin duplicados
- ✅ Fácil migrar de un backend a otro
- ✅ Firebase UID es inmutable (no cambia nunca)
- ✅ Permite auditoría y rastreo de usuarios

---

### 🔐 Interceptor HTTP - Adjunta JWT a Peticiones

[auth.interceptor.ts](client-ionic/src/app/core/interceptors/auth.interceptor.ts)


**Comportamiento:**
- ✅ Obtiene token de Firebase (en SessionStorage/Memory)
- ✅ Si existe: Clona request y añade `Authorization: Bearer {JWT}`
- ✅ Si no existe: Envía request sin header
- ✅ Automático para TODAS las peticiones HTTP

---

### 📊 Tabla Comparativa: Node.js vs Spring Boot

| Aspecto | Node.js | Spring Boot |
|---------|---------|------------|
| **Validación JWT** | Firebase Admin SDK | Spring Security oauth2ResourceServer |
| **Creación de Usuario** | Automática (JIT Provisioning) | Explícita (POST /sync-user) |
| **Buscar Usuario** | MongoDB `findOne()` | JPA `findByFirebaseUid()` |
| **Base de Datos** | MongoDB | PostgreSQL |
| **Endpoint Sync** | POST /api/user/sync | POST /userms/api/auth/sync-user |
| **Endpoint Verificación** | GET /api/user/profile | GET /userms/api/auth/me |
| **Si usuario NO existe en Login** | 401 (authorizeRequestNoCreate) | 404 (Not Found) |
| **Bloqueo de usuarios** | Campo `blocked` + `is_active` | Solo campos de Entity |

---

### 🔄 Centinela - Detección Automática de Cambios

El `AppComponent` implementa un **Centinela** (efecto de Angular Signals) que:

1. **Monitorea autenticación:** Vigila si `authService.isAuthenticated()` cambia
2. **Sincroniza en recargas:** Si el usuario hace F5 o cierra/abre app
3. **Detecta cambios de backend:** Si el usuario cambió backend en login/signup
4. **Ejecuta rollback:** Si algo falla en la sincronización post-reload

[Ver app.component.ts](client-ionic/src/app/app.component.ts) para detalles.

---

### 📋 Resumen del Flujo Completo

```
┌─────────────────────────────────────────────────────────────┐
│                      USUARIO NUEVO                           │
│                    (FLUJO DE REGISTRO)                       │
└─────────────────────────────────────────────────────────────┘

1. SignUpPage.onRegister()
   └─ Recolecta: userName, email, password, confirmPassword

2. AuthService.registerFirebase(email, password)
   └─ Firebase autentica → genera JWT → crea usuario Firebase

3. AuthService.registerBackend({ userName })
   ├─ POST a backend (Node o Spring) con JWT
   │
   ├─ NODE.JS:
   │  ├─ Middleware authorizeRequest valida JWT
   │  ├─ Busca usuario → NO EXISTE → CREA en MongoDB
   │  └─ syncUser actualiza userName → 200 OK
   │
   └─ SPRING BOOT:
      ├─ Spring Security valida JWT
      ├─ Busca usuario en PostgreSQL → NO EXISTE → CREA
      └─ Devuelve 200 OK

4. Cliente recibe 200 OK
   ├─ Limpia localStorage
   └─ Navega a /tabs/players ✅

┌─────────────────────────────────────────────────────────────┐
│                    USUARIO EXISTENTE                         │
│                   (FLUJO DE LOGIN)                           │
└─────────────────────────────────────────────────────────────┘

1. LoginPage.onLogin()
   └─ Recolecta: email, password

2. AuthService.loginFirebase(email, password)
   └─ Firebase autentica → genera JWT

3. AuthService.verifyBackend()
   ├─ GET a /api/user/profile (Node) o /userms/api/auth/me (Spring)
   │
   ├─ NODE.JS:
   │  ├─ Middleware authorizeRequestNoCreate valida JWT
   │  ├─ Busca usuario → SI EXISTE → req.user
   │  └─ Retorna perfil → 200 OK
   │
   └─ SPRING BOOT:
      ├─ Spring Security valida JWT
      ├─ Busca usuario en PostgreSQL
      ├─ SI EXISTE → 200 OK + perfil
      └─ SI NO EXISTE → 404 Not Found

4. Cliente recibe respuesta
   ├─ Si 200: showToast('Login successful!')
   └─ Navega a /tabs/players ✅
```

---
## 📱 APK Android

### 🎯 Características Personalizadas

La app Android incluye configuraciones nativas personalizadas que se aplican durante el build:

- **Branding Personalizado:** Iconos y splash screens con el logotipo de DraftKings (corona + balón)
- **Recursos Nativos Personalizados:** Colores, estilos y layouts específicos en `android.custom/`
- **Firma Digital:** APK firmado con keystore para producción (release build)
- **Capacitor Integration:** Conversión de aplicación web (Angular/Ionic) a aplicación nativa Android
- **Manifest Personalizado:** Configuración de permisos, actividades y proveedores en `AndroidManifest.xml`

### 🔨 Proceso de Build

El build de la APK se realiza de forma **automatizada en CI/CD** (GitHub Actions):

```bash
# 1. Instalar dependencias
npm ci --legacy-peer-deps

# 2. Generar variables de entorno
npm run config

# 3. Compilar assets web (Ionic)
npx ionic build --prod

# 4. Agregar plataforma Android
npx cap add android

# 5. Generar iconos y splash screens nativos
npx capacitor-assets generate --android

# 6. Aplicar recursos personalizados
cp -r android.custom/* android/

# 7. Sincronizar Capacitor
npx cap sync android

# 8. Firmar APK (con keystore en base64)
echo "$KEYSTORE_BASE64" | base64 --decode > ./android/release-key.jks

# 9. Compilar APK en modo Release
cd android && ./gradlew assembleRelease

# 10. Verificar firma digital
apksigner verify --print-certs DraftKings.apk
```

**Ubicación del APK generado:** `android/app/build/outputs/apk/release/DraftKings.apk`

### 📁 Estructura de Personalizaciones

```
android.custom/
├── app/src/main/
│   ├── AndroidManifest.xml    (Configuración nativa)
│   └── res/
│       ├── values/            (Colores, strings, estilos)
│       └── values-night/      (Tema oscuro)
```

## 📦 Instalación y Configuración
**Mencionar Dev Container para cada sección**

### Requisitos previos
- Node.js y npm
- Java JDK 11+
- Ionic CLI
- [Añadir cualquier dependencia de CORBA necesaria]

### Pasos
1. **Clonar el repositorio:**

## 🎨 Estilo Visual y Navegación
- **Estilo:** Moderno, deportivo, con alto contraste. Limpio y funcional.
- **Navegación Principal:** Implementar un **Bottom Tab Bar** (Barra de navegación inferior) presente en todas las vistas (excepto Login y Registro). 
- **Orden del Tab Bar (Izquierda a Derecha):** 
  1. 🏆 Equipo Ideal
  2. ⚽ Jugadores
  3. ⚙️ Ajustes

---