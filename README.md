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
  - Conexión directa a Base de Datos SQL (tabla: `players`)

- **Dependencias:**
  - ✅ Se conecta a **Eureka** para registrarse
  - ✅ Se conecta a **Config Server** para obtener conexión a BD
  - ✅ Se comunica con **Review MS** (cuando necesita datos de reseñas)

#### **5. Review Microservice (Sistema de Reseñas y Valoraciones)**

**Función:** Gestiona comentarios, valoraciones y reseñas de jugadores.

- **Responsabilidades:**
  - CRUD de comentarios y valoraciones (0-5 estrellas)
  - Asociar reseñas a jugadores específicos
  - Calcular promedio de valoraciones
  - Ordenar por más recientes, mejor valoradas, etc.
  - Conexión directa a Base de Datos SQL (tabla: `reviews`)

- **Dependencias:**
  - ✅ Se conecta a **Eureka** para registrarse
  - ✅ Se conecta a **Config Server** para obtener conexión a BD
  - ✅ Se comunica con **Player MS** (para validar que el jugador existe)

#### **6. Manager Microservice (Orquestador de Operaciones Complejas)**

**Función:** Orquesta operaciones complejas que requieren comunicación entre múltiples microservicios.

- **Responsabilidades:**
  - Gestión del "Equipo Ideal" (composición táctica)
  - Valida la disponibilidad de jugadores consultando Player MS
  - Verifica comenatrios consultando Review MS
  - Realiza operaciones transaccionales entre servicios
  - Implementa lógica de negocio de nivel superior

- **Dependencias (críticas):**
  - ✅ Se conecta a **Eureka** para registrarse
  - ✅ Se conecta a **Config Server**
  - ✅ **COMUNICA CON PLAYER MS** (obtener datos de jugadores)
  - ✅ **COMUNICA CON REVIEW MS** (obtener valoraciones)
  - Usa **Feign Client** para comunicación inter-microservicios y balancear la carga

---

## 🔄 Flujo de Comunicación entre Microservicios

### **Ejemplo: Usuario solicita ver "Equipo Ideal" con detalles**

**TO-DO** Refinar rutas

```
1. Frontend (Ionic) → Gateway
   GET /api/strategy/team/123

2. Gateway → Eureka
   "¿Dónde está Manager MS?"
   Respuesta: 192.168.1.5:8081

3. Gateway → Manager MS
   GET /strategy/team/123

4. Manager MS → Eureka
   "¿Dónde está Player MS?"
   Respuesta: 192.168.1.6:8082

5. Manager MS → Player MS (via Feign)
   GET /players/batch (IDs de los 11 jugadores)
   Respuesta: Datos detallados de los jugadores

6. Manager MS → Eureka
   "¿Dónde está Review MS?"
   Respuesta: 192.168.1.7:8083

7. Manager MS → Review MS (via Feign)
   GET /reviews/average/batch (promedio de valoraciones)
   Respuesta: Puntuaciones de los 11 jugadores

8. Manager MS → Frontend (vía Gateway)
   Respuesta completa: Equipo Ideal + Datos Jugadores + Valoraciones
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
6. eureka.client.manager      → Microservicio de Administración
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

## �📱 Flujo de Pantallas y Componentes

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

## 📦 Instalación y Configuración
**Mencionar Dev Container para cada sección**

### Requisitos previos
- Node.js y npm
- Java JDK 11+
- Ionic CLI
- [Añadir cualquier dependencia de CORBA necesaria]

### Pasos
1. **Clonar el repositorio:**
   ```bash
   git clone [https://github.com/tu-usuario/draftkings.git](https://github.com/tu-usuario/draftkings.git)

## 🎨 Estilo Visual y Navegación
- **Estilo:** Moderno, deportivo, con alto contraste. Limpio y funcional.
- **Navegación Principal:** Implementar un **Bottom Tab Bar** (Barra de navegación inferior) presente en todas las vistas (excepto Login y Registro). 
- **Orden del Tab Bar (Izquierda a Derecha):** 
  1. 🏆 Equipo Ideal
  2. ⚽ Jugadores
  3. ⚙️ Ajustes

---