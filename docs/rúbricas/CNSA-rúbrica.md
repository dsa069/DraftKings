# Rúbrica de Evaluación — Pipeline CI/CD y Pruebas

---

## 1. Configuración y ejecución del pipeline de CI/CD (Back-end) — 1.50 puntos

### Evaluación/Justificación

El proyecto configura pipelines de CI/CD desde el inicio del proyecto (0,50 puntos) para los 4 componentes del backend: Node.js, Spring Boot (6 microservicios) y CORBA. Los 4 pipelines se activan con cada push en GitHub (0,25 × 4 = 1,00 puntos). La configuración está en `.github/workflows/` con 13 archivos YAML que cubren CI (construcción, tests, análisis estático) y CD (despliegue a GCP Cloud Run y VMs).

**Factor tiempo:** Los pipelines se configuraron desde el inicio del proyecto, como se evidencia en el historial de commits con mensajes como "ci/corba: ...", "ci/spring: ..." y "ci/node: ...", lo que indica iteración temprana y continua.

### Fragmentos de Código (Evidencias)

**Evidencia 1 — Pipeline de Node.js (desde inicio, activado en push/PR):**

```yaml
# .github/workflows/node-ci.yaml (líneas 1-8)
name: CI/CD Node
on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main, dev]
```

**Evidencia 2 — Pipeline de Spring Boot con matrix de 6 microservicios:**

```yaml
# .github/workflows/spring-ci.yaml (líneas 18-30)
strategy:
  matrix:
    service:
      [
        "eureka.server",
        "config.server",
        "gateway",
        "eureka.client.player",
        "eureka.client.review",
        "eureka.client.user",
      ]
  fail-fast: false
```

**Evidencia 3 — Pipeline de CORBA con Java 8:**

```yaml
# .github/workflows/corba-ci.yaml (líneas 27-33)
- name: Set up JDK 8
  uses: actions/setup-java@v5.2.0
  with:
    java-version: "8"
    distribution: "temurin"
    cache: maven
```

### Referencias

- `.github/workflows/` — Workflows
- `.github/workflows/node-ci.yaml` — Pipeline CI/CD Node.js (105 líneas)
- `.github/workflows/spring-ci.yaml` — Pipeline CI/CD Spring Boot con matrix (160 líneas)
- `.github/workflows/corba-ci.yaml` — Pipeline CI/CD CORBA (250 líneas)
- `.github/workflows/node-cd.yaml` — CD Node.js dev (56 líneas)
- `.github/workflows/spring-cd.yml` — CD Spring Boot dev (115 líneas)
- `.github/workflows/corba-cd.yml` — CD CORBA con Terraform (214 líneas)

---

## 2. Configuración y ejecución continua de CI/CD (Front-end) — 0.50 puntos

### Evaluación/Justificación

El proyecto configura pipelines de CI/CD para el frontend Ionic desde el inicio del proyecto (0,50 puntos) con commits como "ci/ionic: ...". Se activan con cada push en GitHub (0,25 puntos). Los pipelines incluyen construcción, tests de componentes y E2E con Cypress en multi-navegador, compilación de APK Android, y despliegue a Cloud Run.

### Fragmentos de Código (Evidencias)

**Evidencia 1 — Pipeline Ionic Development con triggers:**

```yaml
# .github/workflows/ionic-ci-cd.yaml (líneas 1-8)
name: CI/CD Ionic Development
on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main, dev]
```

**Evidencia 2 — Pipeline Ionic Production con APK firmado:**

```yaml
# .github/workflows/ionic-ci-cd.prod.yml (líneas 118-133)
- name: Decode Keystore
  run: echo "${{ secrets.KEYSTORE_BASE64 }}" | base64 --decode > ./android/release-key.jks

- name: Build APK (Release)
  run: |
    cd android
    ./gradlew assembleRelease
    $ANDROID_HOME/build-tools/34.0.0/apksigner sign \
      --ks release-key.jks \
      --ks-key-alias ${{ secrets.KEY_ALIAS }} \
      --ks-pass pass:${{ secrets.KEYSTORE_PASSWORD }} \
      --key-pass pass:${{ secrets.KEY_PASSWORD }} \
      --out app/build/outputs/apk/release/DraftKings.apk \
      app/build/outputs/apk/release/app-release-unsigned.apk
```

### Referencias

- `.github/workflows/ionic-ci-cd.yaml` — Pipeline Ionic Development (371 líneas)
- `.github/workflows/ionic-ci-cd.prod.yml` — Pipeline Ionic Production con APK firmado (378 líneas)

---

## 3. Ejecución del Pipeline con cada push en GitHub — 1.00 puntos

### Evaluación/Justificación

Los 4 pipelines se ejecutan con cada push en GitHub:

- **Back-end (Node):** 0,25 puntos ✅ — `node-ci.yaml` se activa en push/PR a main y dev
- **Back-end (Spring):** 0,25 puntos ✅ — `spring-ci.yaml` se activa en push/PR a main y dev
- **Back-end (CORBA):** 0,25 puntos ✅ — `corba-ci.yaml` se activa en push/PR a main y dev
- **Front-end (Ionic):** 0,25 puntos ✅ — `ionic-ci-cd.yaml` se activa en push/PR a main y dev

### Referencias

- `.github/workflows/node-ci.yaml` — Trigger: push/PR a main, dev (líneas 3-7)
- `.github/workflows/spring-ci.yaml` — Trigger: push/PR a main, dev (líneas 3-7)
- `.github/workflows/corba-ci.yaml` — Trigger: push/PR a main, dev (líneas 3-7)
- `.github/workflows/ionic-ci-cd.yaml` — Trigger: push/PR a main, dev (líneas 3-7)

---

## 4. Construcción y publicación en registro de contenedores — 1.00 puntos

### Evaluación/Justificación

Los 4 componentes construyen y publican imágenes Docker en GCP Artifact Registry:

- **Back-end (Node):** 0,25 puntos ✅ — Imagen publicada en `us-east1-docker.pkg.dev/cnsa-2026/draftkings/api-node:latest`
- **Back-end (Spring):** 0,25 puntos ✅ — 6 microservicios, cada uno con su imagen (e.g. `eureka-client-player:latest`)
- **Back-end (CORBA):** 0,25 puntos ✅ — Imagen `corba-news-manager:latest` con ORBD + servidor + Tomcat
- **Front-end (Ionic):** 0,25 puntos ✅ — Imagen `client-ionic:latest` (dev) y `client-ionic:0.0.1` (prod)

### Fragmentos de Código (Evidencias)

**Evidencia 1 — Node.js: Docker build y push a Artifact Registry:**

```yaml
# .github/workflows/node-cd.yaml (líneas 42-48)
- name: Build Docker image
  run: |
    docker build -t us-east1-docker.pkg.dev/cnsa-2026/draftkings/api-node:latest .

- name: Push Docker image to Artifact Registry
  run: |
    docker push us-east1-docker.pkg.dev/cnsa-2026/draftkings/api-node:latest
```

**Evidencia 2 — Spring Boot: Docker build con slug transformation:**

```yaml
# .github/workflows/spring-cd.yml (líneas 40-44, 69-75)
- name: Create Service Slugs
  id: slug
  run: |
    CLEAN_NAME=$(echo "${{ inputs.service_name }}" | sed 's/\./-/g')
    echo "service_slug=$CLEAN_NAME" >> $GITHUB_OUTPUT

- name: Build Docker image
  run: |
    docker build -t us-east1-docker.pkg.dev/cnsa-2026/draftkings/${{ steps.slug.outputs.service_slug }}:latest .

- name: Push Docker image to Artifact Registry
  run: |
    docker push us-east1-docker.pkg.dev/cnsa-2026/draftkings/${{ steps.slug.outputs.service_slug }}:latest
```

**Evidencia 3 — CORBA: Docker build con contexto padre:**

```yaml
# .github/workflows/corba-cd.yml (líneas 44-52)
- name: Build Docker image
  run: |
    docker build -t us-east1-docker.pkg.dev/cnsa-2026/draftkings/corba-news-manager:latest -f ../Dockerfile ..

- name: Push Docker image to Artifact Registry
  run: |
    docker push us-east1-docker.pkg.dev/cnsa-2026/draftkings/corba-news-manager:latest
```

**Evidencia 4 — Ionic: Docker build y push:**

```yaml
# .github/workflows/ionic-ci-cd.yaml (líneas 344-350)
- name: Build Docker image
  run: |
    docker build -t us-east1-docker.pkg.dev/cnsa-2026/draftkings/client-ionic:latest .

- name: Push Docker image to Artifact Registry
  run: |
    docker push us-east1-docker.pkg.dev/cnsa-2026/draftkings/client-ionic:latest
```

### Referencias

- `.github/workflows/node-cd.yaml` — CD Node.js con Docker (56 líneas)
- `.github/workflows/spring-cd.yml` — CD Spring Boot con Docker (115 líneas)
- `.github/workflows/corba-cd.yml` — CD CORBA con Docker (214 líneas)
- `.github/workflows/ionic-ci-cd.yaml` — CI/CD Ionic con Docker (371 líneas)

---

## 5. Informe de tests, análisis estático y métricas — 2.00 puntos

### Evaluación/Justificación

Los 4 componentes generan informes de tests, análisis estático y métricas:

- **Back-end (Node):** 0,50 puntos ✅ — Jest con coverage (mattallty/jest-github-action), ESLint annotate, JUnit XML reporter (dorny/test-reporter), uploads de artifacts
- **Back-end (Spring):** 0,50 puntos ✅ — JUnit + JaCoCo (60% mínimo), Checkstyle (Google Checks), dorny/test-reporter, uploads de surefire-reports
- **Back-end (CORBA):** 0,50 puntos ✅ — JaCoCo (50-60% mínimo), Checkstyle, dorny/test-reporter para server y client
- **Front-end (Ionic):** 0,50 puntos ✅ — Cypress component + E2E tests, ESLint annotate, uploads de screenshots/videos

### Fragmentos de Código (Evidencias)

**Evidencia 1 — Node.js: Jest tests con coverage y reporte JUnit:**

```yaml
# .github/workflows/node-ci.yaml (líneas 63-86)
- name: Test
  uses: mattallty/jest-github-action@v1.0.3
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  with:
    test-command: "npm run coverage"
    working-directory: "api-node"

- name: Upload Test Results and Coverage
  if: success() || failure()
  uses: actions/upload-artifact@v7.0.1
  with:
    name: test-results
    path: |
      ./api-node/junit.xml
      ./api-node/coverage/

- name: Test Report
  uses: dorny/test-reporter@v3.0.0
  with:
    artifact: test-results
    name: JEST Tests
    path: "junit.xml"
    reporter: jest-junit
```

**Evidencia 2 — Node.js: ESLint con anotaciones:**

```yaml
# .github/workflows/node-ci.yaml (líneas 45-53)
- name: Save Code Linting Report JSON
  run: npm run lint:json
  continue-on-error: true

- name: Annotate Code Linting Results
  uses: ataylorme/eslint-annotate-action@v4
  with:
    github-token: "${{ secrets.GITHUB_TOKEN }}"
    report-json: "./api-node/coverage/eslint-result.json"
```

**Evidencia 3 — Spring Boot: JaCoCo con mínimo 60% y Checkstyle:**

```yaml
# .github/workflows/spring-ci.yaml (líneas 71-98)
- name: Add ${{ matrix.service }} coverage to PR
  id: jacoco
  uses: madrapps/jacoco-report@v1.7.2
  with:
    paths: ./api-spring/${{ matrix.service }}/target/site/jacoco/jacoco.xml
    token: ${{ secrets.GITHUB_TOKEN }}
    min-coverage-overall: 60
    min-coverage-changed-files: 60
    comment-type: both

- name: Run ${{ matrix.service }} Checkstyle Full Report
  uses: dbelyaev/action-checkstyle@v3.10.0
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    checkstyle_config: google_checks.xml
    reporter: github-pr-check
    workdir: ./api-spring/${{ matrix.service }}

- name: Publish ${{ matrix.service }} Test Results
  uses: dorny/test-reporter@v3.0.0
  with:
    artifact: ${{ matrix.service }}-test-results
    name: JUnit Tests
    path: "*.xml"
    reporter: java-junit
```

**Evidencia 4 — Ionic: Cypress component + E2E con multi-navegador:**

```yaml
# .github/workflows/ionic-ci-cd.yaml (líneas 142-199, 201-254)
tests-components:
  runs-on: ubuntu-latest
  needs: build
  strategy:
    matrix:
      browser: [chrome, firefox]
  steps:
    - name: Component Tests (Cypress)
      uses: cypress-io/github-action@v7
      with:
        working-directory: client-ionic
        install: false
        component: true
        start: npx ionic serve
        wait-on: "http://localhost:8100"
        browser: ${{ matrix.browser }}

tests-e2e:
  runs-on: ubuntu-latest
  needs: build
  strategy:
    matrix:
      browser: [chrome, firefox]
  steps:
    - name: E2E Tests (Cypress)
      uses: cypress-io/github-action@v7
      with:
        working-directory: client-ionic
        install: false
        start: npx ionic serve
        wait-on: "http://localhost:8100"
        browser: ${{ matrix.browser }}
```

### Referencias

- `.github/workflows/node-ci.yaml` — Tests Jest + ESLint (líneas 45-86)
- `.github/workflows/spring-ci.yaml` — JaCoCo + Checkstyle + JUnit (líneas 63-107)
- `.github/workflows/corba-ci.yaml` — JaCoCo + Checkstyle (líneas 56-96)
- `.github/workflows/ionic-ci-cd.yaml` — Cypress component + E2E (líneas 142-254)

---

## 6. Despliegue continuo en la nube — 1.00 puntos

### Evaluación/Justificación

Los 4 componentes se despliegan continuamente en la nube (GCP):

- **Back-end (Node):** 0,25 puntos ✅ — Cloud Run dev (`dk-node-dev`) y prod (`dk-node-prod`)
- **Back-end (Spring):** 0,25 puntos ✅ — Cloud Run con cadena: eureka-server → config-server → [gateway, player, review, user]
- **Back-end (CORBA):** 0,25 puntos ✅ — GCP VM con Terraform (IOR requiere IP directa, no Cloud Run)
- **Front-end (Ionic):** 0,25 puntos ✅ — Cloud Run dev (`draftkings-dev`) y prod (`draftkings`)

### Fragmentos de Código (Evidencias)

**Evidencia 1 — Node.js: Deploy a Cloud Run con secrets:**

```yaml
# .github/workflows/node-cd.yaml (líneas 50-56)
- name: Deploy to Cloud Run
  uses: google-github-actions/deploy-cloudrun@v3
  with:
    service: "dk-node-dev"
    region: "us-east1"
    image: "us-east1-docker.pkg.dev/cnsa-2026/draftkings/api-node:latest"
    flags: "--service-account=draftkings@cnsa-2026.iam.gserviceaccount.com --allow-unauthenticated --ingress=all --set-secrets=/app/enviroments/env=NODE_ENV_DEV:latest"
```

**Evidencia 2 — Spring Boot: Deploy con cadena de microservicios:**

```yaml
# .github/workflows/spring-ci.yaml (líneas 109-132)
deploy-eureka-dev:
  needs: build
  uses: ./.github/workflows/spring-cd.yml
  with:
    service_name: "eureka.server"
  secrets: inherit

deploy-config-dev:
  needs: deploy-eureka-dev
  uses: ./.github/workflows/spring-cd.yml
  with:
    service_name: "config.server"
  secrets: inherit

deploy-clients-dev:
  needs: deploy-config-dev
  strategy:
    matrix:
      service:
        [
          "gateway",
          "eureka.client.player",
          "eureka.client.review",
          "eureka.client.user",
        ]
  uses: ./.github/workflows/spring-cd.yml
  with:
    service_name: ${{ matrix.service }}
  secrets: inherit
```

**Evidencia 3 — CORBA: Deploy a VM con Terraform (resiliencia):**

```yaml
# .github/workflows/corba-cd.yml (líneas 66-95)
- name: Ensure VM is Running
  id: vm_status
  run: |
    STATUS=$(gcloud compute instances describe ${{ env.prefix_name }}-vm-tf --zone=us-east1-c --format='get(status)' 2>/dev/null || echo "NOT_FOUND")

    if [ "$STATUS" = "TERMINATED" ]; then
      gcloud compute instances start ${{ env.prefix_name }}-vm-tf --zone=us-east1-c
      echo "MACHINE_EXISTS=true" >> $GITHUB_OUTPUT
    elif [ "$STATUS" = "RUNNING" ]; then
      echo "MACHINE_EXISTS=true" >> $GITHUB_OUTPUT
    else
      echo "MACHINE_EXISTS=false" >> $GITHUB_OUTPUT
    fi

- name: Deploy Infrastructure with Terraform
  if: steps.vm_status.outputs.MACHINE_EXISTS == 'false'
  working-directory: ./terraform
  run: |
    terraform init -backend-config="prefix=terraform/state/$ENTORNO"
    terraform workspace select $ENTORNO || terraform workspace new $ENTORNO
    terraform apply -auto-approve
```

**Evidencia 4 — Ionic: Deploy a Cloud Run con dependencias de tests:**

```yaml
# .github/workflows/ionic-ci-cd.yaml (líneas 291-363)
deploy:
  runs-on: ubuntu-latest
  needs:
    - tests-components
    - tests-e2e
    - lint-report
  steps:
    - name: Deploy to Cloud Run
      uses: google-github-actions/deploy-cloudrun@v3
      with:
        service: "draftkings-dev"
        region: "us-east1"
        image: "us-east1-docker.pkg.dev/cnsa-2026/draftkings/client-ionic:latest"
        secrets: |
          FIREBASE_CONFIG_DEV=FIREBASE_CONFIG_DEV:latest
          SPRING_API_URL_DEV=SPRING_API_URL_DEV:latest
          NODE_API_URL_DEV=NODE_API_URL_DEV:latest
```

### Referencias

- `.github/workflows/node-cd.yaml` — CD Node.js (56 líneas)
- `.github/workflows/spring-ci.yaml` — Deploy cadena Spring (líneas 109-132)
- `.github/workflows/corba-cd.yml` — CD CORBA con Terraform (214 líneas)
- `.github/workflows/ionic-ci-cd.yaml` — Deploy Ionic (líneas 291-363)
- `teraform` — Configuración de despliegue con terraform de Corba

---

## 7. Servicios Inteligentes — 1.00 puntos

### Evaluación/Justificación

El proyecto implementa servicios de IA en ambos backends:

**Node.js:** LangChain + Groq con modelo `openai/gpt-oss-120b`. Usa `PromptTemplate` → `ChatGroq` → `StructuredOutputParser` con esquema Zod para output estructurado.

**Spring Boot:** Spring AI con `ChatModel` y `BeanOutputConverter` para output estructurado. Mismo prompt táctico que Node.js.

Ambos servicios reciben un mapa de posiciones de fútbol (algunas ocupadas, otras vacías) y la IA recomienda jugadores reales para completar la alineación táctica.

### Fragmentos de Código (Evidencias)

**Evidencia 1 — Node.js: LangChain + Groq con Zod schema:**

```typescript
// api-node/draftKings_api/services/aiTacticService.ts (líneas 1-61)
import { z } from "zod";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { ChatGroq } from "@langchain/groq";

export class AiTacticService {
  private schema = z.object({
    message: z.string().describe("Mensaje descriptivo y justificación táctica"),
    recommendations: z
      .record(z.string(), z.string())
      .describe("Posiciones vacías → jugador recomendado"),
  });

  constructor() {
    const model = new ChatGroq({
      model: "openai/gpt-oss-120b",
      temperature: 0.7,
    });
    this.parser = StructuredOutputParser.fromZodSchema(this.schema);
    this.chain = RunnableSequence.from([
      new PromptTemplate({
        template: `You are a world-class football manager...
        Currently occupied positions: {filledPositions}
        Positions you must fill: {emptyPositions}`,
        inputVariables: ["filledPositions", "emptyPositions"],
        partialVariables: {
          format_instructions: this.parser.getFormatInstructions(),
        },
      }),
      model,
      this.parser,
    ]);
  }

  async getRecommendations(positions: Record<string, string | null>) {
    const emptyPositions = Object.keys(positions).filter(
      (pos) => positions[pos] === null,
    );
    const filledPositions = Object.entries(positions)
      .filter(([, player]) => player !== null)
      .map(([pos, player]) => `${pos}: ${player}`)
      .join(", ");
    return await this.chain.invoke({
      filledPositions: filledPositions || "Ninguna",
      emptyPositions: emptyPositions.join(", "),
    });
  }
}
```

**Evidencia 2 — Spring Boot: Spring AI con BeanOutputConverter:**

```java
// api-spring/eureka.client.player/src/main/java/draftkings/eureka/client/player/service/AiTacticServiceImpl.java (líneas 17-91)
@Service
public class AiTacticServiceImpl implements AiTacticService {
    private final ChatModel chatModel;
    private final BeanOutputConverter<TacticRecommendationResponseDTO> outputConverter;

    public AiTacticServiceImpl(ChatModel chatModel) {
        this.chatModel = chatModel;
        this.outputConverter = new BeanOutputConverter<>(TacticRecommendationResponseDTO.class);
    }

    @Override
    public TacticRecommendationResponseDTO getRecommendations(Map<String, String> positions) {
        List<String> emptyPositions = positions.entrySet().stream()
                .filter(entry -> entry.getValue() == null)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());

        String template = """
                You are a world-class football manager and expert tactical analyst.
                Given a list of positions occupied by players and a list of empty positions...
                Currently occupied positions: {filledPositions}
                Positions you must fill: {emptyPositions}
                """;

        PromptTemplate promptTemplate = new PromptTemplate(template);
        promptTemplate.add("filledPositions", filledPositions.isEmpty() ? "None" : filledPositions);
        promptTemplate.add("emptyPositions", String.join(", ", emptyPositions));
        promptTemplate.add("format_instructions", outputConverter.getFormat());

        Prompt prompt = promptTemplate.create();
        ChatResponse chatResponse = chatModel.call(prompt);
        String rawOutput = chatResponse.getResult().getOutput().getText();
        return outputConverter.convert(rawOutput);
    }
}
```

### Referencias

- `api-node/draftKings_api/services/aiTacticService.ts` — Servicio IA Node.js con LangChain + Groq (90 líneas)
- `api-spring/eureka.client.player/src/main/java/draftkings/eureka/client/player/service/AiTacticServiceImpl.java` — Servicio IA Spring con Spring AI (92 líneas)

---

## 8. Tests de Cypress — Funcionalidad de Autenticación — 1.00 puntos

### Evaluación/Justificación

Los tests de autenticación con Cypress cubren:

- **Escenario de éxito:** 0,25 puntos ✅ — Login exitoso, registro con sync backend, verificación de navegación post-login
- **Escenarios de error:** 0,75 puntos ✅ — Formulario vacío, email inválido, credenciales rechazadas por Firebase, username corto, contraseña sin política, contraseñas no coincidentes, rollback tras fallo de sync
- **Multi-navegador:** Tests ejecutados en Chrome y Firefox (matriz en CI), multiplicador × 1,0 = mantiene valor total

**Total Autenticación:** (0,75 + 0,25) × 1,0 = 1,00 puntos

### Fragmentos de Código (Evidencias)

**Evidencia 1 — Test de login exitoso con verificación de backend:**

```typescript
// client-ionic/cypress/e2e/auth.e2e.cy.ts (líneas 61-92)
it("permite iniciar sesión, verificar backend y entrar en jugadores", () => {
  cy.get("app-login").then(($loginEl) => {
    cy.window().then((win) => {
      const loginCmp = (win as any).ng.getComponent($loginEl[0]);
      const authService = loginCmp.authService;
      authService.loginFirebase = cy.stub().resolves(signedInResponse);
      authService.verifyBackend = cy.stub().resolves();
      authService.isAuthenticated = () => true;
      authService.userProfile = () => adminProfile;
    });
  });

  cy.intercept("GET", "**/players", []).as("players");
  typeIntoIonInput(
    'ion-input[formControlName="email"]',
    "coach@draftkings.com",
  );
  typeIntoIonInput('ion-input[formControlName="password"]', "ValidPass123!");
  clickIonButton("Login");
  cy.wait("@players");
  cy.url().should("include", "/#/tabs/players");
  getToastMessage().should("contain.text", "Login successful!");
});
```

**Evidencia 2 — Test de error: credenciales rechazadas por Firebase:**

```typescript
// client-ionic/cypress/e2e/auth.e2e.cy.ts (líneas 34-59)
it("muestra error si Firebase rechaza las credenciales del login", () => {
  cy.intercept("POST", firebaseSignInUrl, {
    statusCode: 400,
    body: { error: { message: "INVALID_LOGIN_CREDENTIALS" } },
  }).as("firebaseSignIn");

  typeIntoIonInput(
    'ion-input[formControlName="email"]',
    "coach@draftkings.com",
  );
  typeIntoIonInput('ion-input[formControlName="password"]', "WrongPass123!");
  clickIonButton("Login");
  cy.wait("@firebaseSignIn");
  getToastMessage().should(
    "contain.text",
    "Login failed. Please check your credentials.",
  );
  cy.url().should("include", "/#/login");
});
```

**Evidencia 3 — Test de rollback: registro falla después de crear cuenta en Firebase:**

```typescript
// client-ionic/cypress/e2e/auth.e2e.cy.ts (líneas 228-263)
it("muestra error si el registro falla después de crear la cuenta en Firebase", () => {
  cy.get("app-sign-up").then(($signUpEl) => {
    cy.window().then((win) => {
      const signUpCmp = (win as any).ng.getComponent($signUpEl[0]);
      const authService = signUpCmp.authService;
      authService.registerFirebase = cy.stub().resolves(signedInResponse);
      authService.registerBackend = cy.stub().rejects(new Error("Sync failed"));
      authService.deleteCurrentUser = cy.stub().resolves();
    });
  });
  // ... fill form and submit
  getToastMessage().should(
    "contain.text",
    "Registration error. Please try again.",
  );
});
```

**Evidencia 4 — Configuración multi-navegador en CI:**

```yaml
# .github/workflows/ionic-ci-cd.yaml (líneas 151-153, 211-212)
strategy:
  matrix:
    browser: [chrome, firefox]
```

### Referencias

- `client-ionic/cypress/e2e/auth.e2e.cy.ts` — 9 tests de autenticación (264 líneas)
- `.github/workflows/ionic-ci-cd.yaml` — Ejecución multi-navegador (líneas 151-153, 211-212)

---

## 9. Tests de Cypress — Funcionalidad CRUD (Jugadores y Comentarios) — 1.00 puntos

### Evaluación/Justificación

Los tests CRUD cubren jugadores y comentarios:

- **Escenario de éxito:** 0,25 puntos ✅ — CRUD completo de jugadores (crear, ver detalle, editar, eliminar) y comentarios (crear, editar, eliminar con confirmación)
- **Escenarios de error:** 0,75 puntos ✅ — Validación de formularios, errores de red, permisos por rol (admin/user/anonymous), estados vacíos
- **Multi-navegador:** Tests ejecutados en Chrome y Firefox, multiplicador × 1,0 = mantiene valor total

**Total CRUD:** (0,75 + 0,25) × 1,0 = 1,00 puntos

### Fragmentos de Código (Evidencias)

**Evidencia 1 — CRUD de Jugadores: crear jugador desde formulario:**

```typescript
// client-ionic/cypress/e2e/players.e2e.cy.ts (líneas 181-226)
it("permite crear un jugador desde el formulario y navegar al detalle", () => {
  cy.intercept("POST", "**/players", (req) => {
    expect(req.body).to.include({
      name: "Vinicius Junior",
      firstName: "Vinicius",
      lastName: "Junior",
      team: "Real Madrid",
      league: "La Liga",
      position: "fw",
      number: 7,
    });
    req.reply({ statusCode: 201, body: createdPlayer });
  }).as("createPlayer");

  clickIonButton("Add Player");
  typeIntoIonInput(
    'ion-input[formControlName="displayName"]',
    "Vinicius Junior",
  );
  // ... fill all fields
  clickIonButton("Save Player");
  cy.wait("@createPlayer");
  cy.url().should("include", "/#/player-detail/99");
});
```

**Evidencia 2 — CRUD de Jugadores: eliminar con confirmación:**

```typescript
// client-ionic/cypress/e2e/players.e2e.cy.ts (líneas ~400-450)
it("permite eliminar un jugador existente con confirmación", () => {
  cy.intercept("DELETE", "**/players/1", { statusCode: 204 }).as(
    "deletePlayer",
  );
  cy.contains("ion-button", "Delete Player").click();
  cy.get("ion-alert").should("be.visible");
  cy.contains("ion-alert button", "Confirm").click();
  cy.wait("@deletePlayer");
  cy.url().should("include", "/#/tabs/players");
  cy.contains(".player-card", "Lionel Messi").should("not.exist");
});
```

**Evidencia 3 — CRUD de Comentarios: crear comentario con geolocalización:**

```typescript
// client-ionic/cypress/e2e/reviews.e2e.cy.ts (líneas ~100-150)
it("permite crear un comentario con geolocalización", () => {
  cy.intercept("POST", "**/players/1/reviews", (req) => {
    expect(req.body).to.have.property("text");
    expect(req.body).to.have.property("rating");
    req.reply({
      statusCode: 201,
      body: { id: "3", text: "Great player!", rating: 5 },
    });
  }).as("createReview");

  clickIonButton("Add Comment");
  typeIntoIonInput('ion-textarea[formControlName="text"]', "Great player!");
  // ... set rating
  clickIonButton("Save");
  cy.wait("@createReview");
});
```

**Evidencia 4 — Tests de permisos: usuario regular no puede editar/eliminar:**

```typescript
// client-ionic/cypress/e2e/players.e2e.cy.ts (líneas ~450-500)
it("un usuario registrado no puede editar ni eliminar jugadores", () => {
  setAuthOnCurrentView("app-player-detail", {
    isAuthenticated: true,
    isAdmin: false,
    isUser: true,
    profile: registeredProfile,
  });
  cy.contains("ion-button", "Edit Player").should("not.exist");
  cy.contains("ion-button", "Delete Player").should("not.exist");
});
```

### Referencias

- `client-ionic/cypress/e2e/players.e2e.cy.ts` — 13 tests de jugadores (705 líneas)
- `client-ionic/cypress/e2e/reviews.e2e.cy.ts` — 11 tests de comentarios (685 líneas)
- `client-ionic/cypress/e2e/import-players.e2e.cy.ts` — 5 tests de importación (256 líneas)
- `client-ionic/cypress/e2e/tabs.e2e.cy.ts` — 2 tests de navegación (27 líneas)

---

## 10. Tareas Optativas — Matrícula de Honor

### Evaluación/Justificación

**Uso de diferentes entornos (Staging y Producción):** ✅ Implementado

El proyecto mantiene separación completa entre dev y prod:

- **Pipelines separados:** `ionic-ci-cd.yaml` (dev) vs `ionic-ci-cd.prod.yml` (prod)
- **Cloud Run services:** `draftkings-dev` vs `draftkings` (prod)
- **Docker tags:** `:latest` (dev) vs `:0.0.1` (prod)
- **Secrets separados:** `FIREBASE_CONFIG_DEV` vs `FIREBASE_CONFIG_PROD`
- **Branch protection:** Solo `dev` puede hacer PR a `main` (`check-pr-main.yml`)
- **Bases de datos:** Usamos Saas para los despliegues: Mongo Atlas (Node) y Supabase (Postgres)

**Compilar aplicación Android:** ✅ Implementado

- **Dev:** APK debug con `assembleDebug` (ionic-ci-cd.yaml, build-android job)
- **Prod:** APK release firmado con keystore + apksigner verify (ionic-ci-cd.prod.yml)

### Fragmentos de Código (Evidencias)

**Evidencia 1 — Branch protection: solo dev puede mergear a main:**

```yaml
# .github/workflows/check-pr-main.yml (líneas 1-15)
name: Check Main Source Branch
on:
  pull_request:
    branches:
      - main
jobs:
  main_check_source:
    runs-on: ubuntu-latest
    steps:
      - name: Verify that branch is 'dev'
        if: github.head_ref != 'dev'
        run: |
          echo "ERROR: Solo se permiten Merges a 'main' desde la rama 'dev'."
          exit 1
```

**Evidencia 2 — Deploy prod solo en rama main:**

```yaml
# .github/workflows/spring-ci.yaml (líneas 134-136)
deploy-eureka-prod:
  if: github.ref == 'refs/heads/main'
  needs: build
  uses: ./.github/workflows/spring-cd.prod.yml
```

**Evidencia 3 — APK firmado en producción:**

```yaml
# .github/workflows/ionic-ci-cd.prod.yml (líneas 118-146)
- name: Decode Keystore
  run: echo "${{ secrets.KEYSTORE_BASE64 }}" | base64 --decode > ./android/release-key.jks

- name: Build APK (Release)
  run: |
    cd android
    ./gradlew assembleRelease
    $ANDROID_HOME/build-tools/34.0.0/apksigner sign \
      --ks release-key.jks --ks-key-alias ${{ secrets.KEY_ALIAS }} ...

- name: Verify APK Signature
  run: |
    $ANDROID_HOME/build-tools/34.0.0/apksigner verify --print-certs ${{ steps.locate_apk.outputs.apk_path }}
```

### Referencias

- `.github/workflows/check-pr-main.yml` — Branch protection (15 líneas)
- `.github/workflows/ionic-ci-cd.prod.yml` — Production pipeline con APK firmado (378 líneas)
- `.github/workflows/spring-ci.yaml` — Deploy prod condicional (líneas 134-160)
- `.github/workflows/node-ci.yaml` — Deploy prod condicional (líneas 97-105)

---

## Resumen de Puntuación

| Criterio                                                       | Puntos Max. | Puntos Obtenidos |    Estado    |
| -------------------------------------------------------------- | :---------: | :--------------: | :----------: |
| 1. Configuración CI/CD Back-end (factor tiempo)                |    1.50     |       1.50       |      OK      |
| 2. Configuración CI/CD Front-end (factor tiempo)               |    0.50     |       0.50       |      OK      |
| 3. Ejecución con cada push (4 × 0.25)                          |    1.00     |       1.00       |      OK      |
| 4. Construcción y publicación registro contenedores (4 × 0.25) |    1.00     |       1.00       |      OK      |
| 5. Informe tests, análisis estático y métricas (4 × 0.50)      |    2.00     |       2.00       |      OK      |
| 6. Despliegue continuo en la nube (4 × 0.25)                   |    1.00     |       1.00       |      OK      |
| 7. Servicios Inteligentes                                      |    1.00     |       1.00       |      OK      |
| 8. Cypress Autenticación ((1.00+0.25) × 1.0 multi-nav)         |    1.00     |       1.00       |      OK      |
| 9. Cypress CRUD ((1.00+0.25) × 1.0 multi-nav)                  |    1.00     |       1.00       |      OK      |
| **Total**                                                      |  **10.0**   |     **10.0**     |    **OK**    |
| Opt: Entornos dev/prod                                         |    Extra    |        OK        | Implementado |
| Opt: APK Android                                               |    Extra    |        OK        | Implementado |

**Calificación final: 10.00/10.00 + Matrícula de Honor**

### Detalle de multiplicadores Cypress

| Funcionalidad              | Base (éxito+error) |   Navegadores    | Multiplicador | Total |
| -------------------------- | :----------------: | :--------------: | :-----------: | :---: |
| Autenticación              |        1.00        | Chrome + Firefox |     × 1.0     | 1.00  |
| CRUD Jugadores/Comentarios |        1.00        | Chrome + Firefox |     × 1.0     | 1.00  |
