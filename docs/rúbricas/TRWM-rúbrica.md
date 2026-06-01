# Rúbrica de Evaluación — DraftKings API (api-node)

---

## 1. Creación del servicio Web de carga de datos en MongoDB a partir de la API pública (2 puntos)

### Evaluación/Justificación

El proyecto implementa un servicio completo de carga de datos que conecta con la API externa **API-Football** (`v3.football.api-sports.io`) para obtener perfiles de jugadores, normaliza los datos recibidos y los almacena en MongoDB mediante `insertMany` para mayor eficiencia. El servicio sigue un patrón de capas (Service → Controller → Route) con separación de responsabilidades claras.

El flujo completo es:
1. El cliente envía una petición de búsqueda a `GET /api/players/external?search=Messi`
2. El controlador delega en `ApiFootballService.searchPlayers()` que consulta la API externa
3. Los datos se normalizan (mapeo de campos de la API al modelo interno)
4. El endpoint `POST /api/players/import` recibe el array normalizado y ejecuta `importPlayers()` que transforma lat/lng a formato GeoJSON Point y ejecuta `Player.insertMany()`

Además, el proyecto integra un segundo sistema externo (CORBA) para noticias mediante `NewsService`, demostrando capacidad de integración con múltiples APIs públicas/externas.

### Fragmentos de Código (Evidencias)

**Evidencia 1 — Servicio de conexión con API externa y normalización de datos:**

```typescript
// draftKings_api/services/apiFootballService.ts (líneas 8-51)
async searchPlayers(search?: string): Promise<any[]> {
    const params: any = {};
    if (search) params.search = search;

    try {
      const response = await axios.get(
        "https://v3.football.api-sports.io/players/profiles",
        {
          headers: {
            "x-apisports-key": this.apiKey,
            "x-rapidapi-host": "v3.football.api-sports.io",
          },
          params,
        },
      );

      const data = response.data;
      if (!data || !data.response || !Array.isArray(data.response)) return [];

      return data.response.map((item: any) => ({
        name: item.player.name,
        firstName: item.player.firstname || "",
        lastName: item.player.lastname || "",
        age: item.player.age || undefined,
        birthdate: item.player.birth?.date || undefined,
        nationality: item.player.nationality || "",
        position: item.player.position || "",
        photoUrl: item.player.photo || "",
        team: "API Football",
        league: "External",
        latitude: 0,
        longitude: 0,
        height: item.player.height || undefined,
        weight: item.player.weight || undefined,
        number: item.player.number || undefined,
      }));
    } catch (error) {
      console.error("Error fetching from API-Football:", error);
      throw new Error("Failed to fetch players from external API", {
        cause: error,
      });
    }
  }
```

**Evidencia 2 — Importación masiva a MongoDB con transformación GeoJSON:**

```typescript
// draftKings_api/services/apiFootballService.ts (líneas 55-73)
async importPlayers(players: any[]): Promise<void> {
    if (!players || players.length === 0) return;

    const docsToInsert = players.map((player) => ({
      ...player,
      birthdate: player.birthdate ? new Date(player.birthdate) : null,
      coords: {
        type: "Point",
        coordinates: [
          Number(player.longitude || 0),
          Number(player.latitude || 0),
        ],
      },
    }));

    await Player.insertMany(docsToInsert);
  }
```

**Evidencia 3 — Estructura de capas (Route → Controller → Service):**

```typescript
// draftKings_api/routes/playerRoutes.ts (líneas 58, 88)
router.get("/external", authorizeRequest, playersGetExternal);
router.post("/import", authorizeRequest, playersImport);

// draftKings_api/controllers/playerController.ts (líneas 134-156)
export const playersGetExternal = async (req: Request, res: Response) => {
  try {
    const search = req.query.search as string;
    const players = await apiFootballService.searchPlayers(search);
    return res.status(200).json(players);
  } catch (err: any) {
    if (err.isAxiosError || err.response || err.message.includes("timeout") || err.message.includes("network")) {
      return res.status(503).json({
        message: "Service Unavailable: Fallo en la comunicación con la API externa.",
      });
    }
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};
```

### Referencias

- `draftKings_api/services/apiFootballService.ts` — Servicio completo de integración con API-Football (líneas 1-74)
- `draftKings_api/services/newsService.ts` — Servicio de integración con sistema CORBA externo (líneas 1-145)
- `draftKings_api/controllers/playerController.ts` — Funciones `playersGetExternal` (línea 134) y `playersImport` (línea 159)
- `draftKings_api/routes/playerRoutes.ts` — Rutas `/external` (línea 58) y `/import` (línea 88)

---

## 2. Definición del modelo de datos utilizando Mongoose (ODM) — Esquema principal y anidados (2 puntos)

### Evaluación/Justificación

El proyecto define **3 modelos Mongoose** con esquemas completos, validaciones, tipos TypeScript, relaciones entre colecciones (ObjectId refs), transformaciones `toJSON` personalizadas e índices geoespaciales:

- **Player** (esquema principal): Incluye campos personales, deportivos, GeoJSON para geolocalización con índice `2dsphere`, y una transformación `toJSON` que convierte `_id` a `id`, extrae `latitude`/`longitude` desde el GeoJSON, formatea `birthdate` a `YYYY-MM-DD`, y elimina campos internos de Mongoose (`_id`, `__v`, `coords`).

- **Review** (esquema anidado/relacionado): Referencia ObjectId a `User` y `Player` (relaciones 1:N), con validaciones `maxlength` en texto, `min`/`max` en rating, GeoJSON propio, y transformación `toJSON` que renombra `user` a `user_id` y oculta `player` para evitar redundancia.

- **User** (esquema de autenticación): Vinculado a Firebase UID con `unique: true`, campos de rol y estado (`is_active`, `blocked`), y `timestamps: true` automático.

- **News** (interfaz TypeScript): Interface `INews` para datos del sistema externo CORBA (no se almacena en MongoDB, se consume en tiempo real).

### Fragmentos de Código (Evidencias)

**Evidencia 1 — Modelo Player con GeoJSON, validaciones e índice geoespacial:**

```typescript
// draftKings_api/models/player.ts (líneas 21-43)
const playerSchema = new Schema<IPlayer>({
  name: { type: String, required: true },
  firstName: String,
  lastName: String,
  age: { type: Number, min: 0, max: 99 },
  birthdate: { type: Date, default: null },
  nationality: String,
  height: Number,
  weight: Number,
  number: Number,
  team: String,
  league: String,
  position: String,
  photoUrl: String,
  coords: {
    type: { type: String, default: "Point" },
    coordinates: { type: [Number], required: true },
  },
  created_at: { type: Date, default: Date.now },
});

playerSchema.index({ coords: "2dsphere" });
```

**Evidencia 2 — Transformación toJSON personalizada del Player:**

```typescript
// draftKings_api/models/player.ts (líneas 48-75)
playerSchema.set("toJSON", {
  transform: (doc: any, ret: any) => {
    const obj: any = ret;
    obj.id = obj._id;

    if (obj.coords && obj.coords.coordinates) {
      obj.longitude = obj.coords.coordinates[0];
      obj.latitude = obj.coords.coordinates[1];
    }

    if (obj.birthdate) {
      obj.birthdate = new Date(obj.birthdate).toISOString().split("T")[0];
    }

    delete obj._id;
    delete obj.__v;
    delete obj.coords;

    return obj;
  },
});
```

**Evidencia 3 — Modelo Review con referencias ObjectId (esquema anidado):**

```typescript
// draftKings_api/models/review.ts (líneas 14-25)
const reviewSchema = new Schema<IReview>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  player: { type: Schema.Types.ObjectId, ref: "Player", required: true },
  author: { type: String, required: true },
  text: { type: String, required: true, maxlength: 1000 },
  rating: { type: Number, required: true, min: 0, max: 5 },
  coords: {
    type: { type: String, default: "Point" },
    coordinates: { type: [Number], required: true },
  },
  created_at: { type: Date, default: Date.now },
});
```

**Evidencia 4 — Modelo User con Firebase UID y roles:**

```typescript
// draftKings_api/models/user.ts (líneas 3-13)
const userSchema = new Schema(
  {
    firebaseUid: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    userName: { type: String, required: false },
    role: { type: String, default: "USER" },
    is_active: { type: Boolean, default: true },
    blocked: { type: Boolean, default: false },
  },
  { timestamps: true },
);
```

### Referencias

- `draftKings_api/models/player.ts` — Modelo Player completo (líneas 1-78)
- `draftKings_api/models/review.ts` — Modelo Review con refs (líneas 1-53)
- `draftKings_api/models/user.ts` — Modelo User con Firebase (líneas 1-21)
- `draftKings_api/models/news.ts` — Interface INews para datos externos (líneas 1-11)

---

## 3. Creación de la API REST — Rutas parametrizadas y operaciones CRUD sobre documentos principales y anidados (3 puntos)

### Evaluación/Justificación

La API REST está organizada en **5 archivos de rutas** bajo el prefijo `/api`, con un total de **14 endpoints** que cubren operaciones CRUD completas sobre documentos principales (Players, Users, Reviews, Tactics, News) y documentos anidados (Reviews anidados bajo Players en `/api/players/:id/reviews`).

**Características destacadas:**

- **Rutas parametrizadas**: Todas las rutas de detalle utilizan `/:id` como parámetro de ruta, validado con `mongoose.Types.ObjectId.isValid()` y `CastError` para IDs inválidos.

- **CRUD completo en Players**:
  - `GET /api/players` — Listado paginado con filtros (search, team, league, startDate)
  - `GET /api/players/:id` — Detalle por ID
  - `POST /api/players` — Creación (requiere auth)
  - `PUT /api/players/:id` — Actualización parcial (requiere auth + ADMIN)
  - `DELETE /api/players/:id` — Eliminación (requiere auth + ADMIN)

- **Documentos anidados (Reviews bajo Players)**:
  - `GET /api/players/:id/reviews` — Listado de reseñas de un jugador
  - `POST /api/players/:id/reviews` — Crear reseña para un jugador

- **CRUD en Reviews (rutas independientes)**:
  - `PUT /api/reviews/:id` — Editar reseña (ADMIN)
  - `DELETE /api/reviews/:id` — Eliminar reseña (ADMIN)

- **Usuarios**: `POST /api/user/sync` (sincronización JIT), `GET /api/user/profile`
- **Tácticas**: `POST /api/tactics/recommendations` (IA)
- **Noticias**: `GET /api/news`, `GET /api/news/:id`, `POST /api/news` (ADMIN)

- **Código de estado HTTP correcto**: 200 (OK), 201 (Created), 204 (No Content), 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 500 (Internal Server Error), 503 (Service Unavailable).

### Fragmentos de Código (Evidencias)

**Evidencia 1 — Rutas parametrizadas con CRUD completo (Players):**

```typescript
// draftKings_api/routes/playerRoutes.ts (líneas 152-280)
router.get("/", playersReadAll);
router.get("/:id", playersReadOne);
router.post("/", authorizeRequest, playersCreate);
router.put("/:id", authorizeRequest, requireAdmin, playersUpdate);
router.delete("/:id", authorizeRequest, requireAdmin, playersDelete);
```

**Evidencia 2 — Documentos anidados (Reviews bajo Players):**

```typescript
// draftKings_api/routes/playerRoutes.ts (líneas 313, 360)
router.get("/:id/reviews", reviewsGetByPlayer);
router.post("/:id/reviews", reviewsCreate);
```

**Evidencia 3 — Validación de parámetros y control de errores en controlador:**

```typescript
// draftKings_api/controllers/playerController.ts (líneas 52-67)
export const playersReadOne = async (req: Request, res: Response) => {
  try {
    let id = req.params.id as string | string[] | undefined;
    if (Array.isArray(id)) id = id[0];
    if (!id) return res.status(400).json({ message: "Bad Request" });

    const player = await Player.findById(id).exec();
    if (!player) return res.status(404).json({ message: "not found" });

    return res.status(200).json(player);
  } catch (err: any) {
    if (err.name === "CastError")
      return res.status(400).json({ message: "Bad Request: ID inválido" });
    res.status(500).json({ message: "Internal Server Error" });
  }
};
```

**Evidencia 4 — CRUD en Reviews con validación de existencia del jugador (anidado):**

```typescript
// draftKings_api/controllers/reviewController.ts (líneas 35-98)
export const reviewsCreate = async (req: Request, res: Response) => {
  try {
    let playerId = req.params.id as string | string[] | undefined;
    if (Array.isArray(playerId)) playerId = playerId[0];
    if (!playerId) return res.status(400).json({ message: "Bad Request" });

    if (!mongoose.Types.ObjectId.isValid(playerId)) {
      return res.status(400).json({ message: "Identificador de jugador inválido" });
    }

    const { author, text, rating, latitude, longitude } = req.body;
    if (!text || rating === undefined) {
      return res.status(400).json({
        message: "Body de la reseña inválido o incompleto. Se requiere text y rating.",
      });
    }

    const playerExists = await Player.findById(playerId).exec();
    if (!playerExists) {
      return res.status(404).json({ message: "Jugador no encontrado" });
    }

    const userId = req.user ? req.user._id : new mongoose.Types.ObjectId();
    const finalAuthor = author || (req.user && req.user.userName ? req.user.userName : "Anónimo");

    const newReview = new Review({
      user: userId,
      player: playerId,
      author: finalAuthor,
      text,
      rating,
      coords: {
        type: "Point",
        coordinates: [Number(longitude || 0), Number(latitude || 0)],
      },
    });

    const savedReview = await newReview.save();
    return res.status(201).json(savedReview);
  } catch (err: any) {
    if (err.name === "MongooseError" || err.message.includes("timeout") || err.name === "MongoNetworkError") {
      return res.status(503).json({ message: "Servicio de reseñas no disponible" });
    }
    return res.status(500).json({ message: "Error interno inesperado", error: err.message });
  }
};
```

**Evidencia 5 — Paginación y filtros en listado:**

```typescript
// draftKings_api/controllers/playerController.ts (líneas 10-49)
export const playersReadAll = async (req: Request, res: Response) => {
  try {
    const { search, team, league, startDate, page, size } = req.query;
    const pageNum = page !== undefined ? parseInt(page as string) : 0;
    const sizeNum = size !== undefined ? parseInt(size as string) : 10;

    if (isNaN(pageNum) || pageNum < 0 || isNaN(sizeNum) || sizeNum <= 0) {
      return res.status(400).json({ message: "Parámetros de paginación inválidos" });
    }

    const queryFilter: any = {};
    if (search) queryFilter.name = { $regex: search, $options: "i" };
    if (team) queryFilter.team = team;
    if (league) queryFilter.league = league;
    if (startDate) queryFilter.created_at = { $gte: new Date(startDate as string) };

    const totalItems = await Player.countDocuments(queryFilter);
    const players = await Player.find(queryFilter)
      .skip(pageNum * sizeNum)
      .limit(sizeNum)
      .exec();

    return res.status(200).json({
      content: players,
      totalElements: totalItems,
      totalPages: Math.ceil(totalItems / sizeNum),
      number: pageNum,
      size: sizeNum,
    });
  } catch (err: any) {
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};
```

### Referencias

- `draftKings_api/routes/playerRoutes.ts` — 9 endpoints de jugadores y reseñas anidadas (362 líneas)
- `draftKings_api/routes/reviewRoutes.ts` — 2 endpoints de reseñas independientes (89 líneas)
- `draftKings_api/routes/userRoutes.ts` — 2 endpoints de usuarios (94 líneas)
- `draftKings_api/routes/tacticRoutes.ts` — 1 endpoint de tácticas IA (64 líneas)
- `draftKings_api/routes/newsRoutes.ts` — 3 endpoints de noticias (167 líneas)
- `draftKings_api/controllers/playerController.ts` — Controlador CRUD de jugadores (192 líneas)
- `draftKings_api/controllers/reviewController.ts` — Controlador CRUD de reseñas (165 líneas)
- `draftKings_api/controllers/userController.ts` — Controlador de usuarios (50 líneas)
- `app.ts` — Registro de todas las rutas bajo prefijo `/api` (líneas 83-87)

---

## 4. Seguridad de la API con JSON Web Token y Documentación de la API con Swagger (1 punto)

### Evaluación/Justificación

### 4.1 Seguridad con JWT (Firebase Authentication)

La API utiliza **Firebase Admin SDK** para la verificación de tokens JWT. El sistema implementa 3 middlewares de autorización con responsabilidades diferenciadas:

- **`authorizeRequest`**: Verifica el token Bearer, busca/crea el usuario en MongoDB (provisionamiento "Just-In-Time"), y adjunta `req.user`, `req.firebaseUser`, `req.isNewUser`. Valida que el usuario esté activo y no bloqueado.

- **`authorizeRequestNoCreate`**: Misma verificación pero sin auto-creación. Devuelve 404 si el usuario no existe. Usado para rutas de solo lectura.

- **`requireAdmin`**: Guard de roles que verifica `req.user.role === "ADMIN"`. Devuelve 403 si no tiene privilegios.

La configuración de Firebase sanitiza la `private_key` del servicio (reemplazando saltos de línea) y previene inicialización doble en tests.

### 4.2 Documentación con Swagger (OpenAPI 3.0)

El proyecto configura `swagger-jsdoc` y `swagger-ui-express` con un spec OpenAPI 3.0 completo que incluye:
- Esquemas de componentes (`Player`, `Review`, `User`, `News`)
- Security scheme `bearerAuth` (JWT)
- Anotaciones JSDoc `@swagger` en todas las rutas y controladores
- Swagger UI montado en `/api-docs`

### Fragmentos de Código (Evidencias)

**Evidencia 1 — Middleware de autorización JWT con Firebase:**

```typescript
// draftKings_api/middleware/auth.middleware.ts (líneas 9-92)
export async function authorizeRequest(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Petición no autorizada" });
    }

    const token = header.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Petición no autorizada" });
    }

    const decodedToken = await authAdmin.verifyIdToken(token);

    let user = await User.findOne({
      firebaseUid: decodedToken.uid,
      is_active: true,
      blocked: false,
    });

    let isNewUserFlag = false;
    if (!user) {
      const userExistsButInvalid = await User.exists({
        firebaseUid: decodedToken.uid,
      });

      if (userExistsButInvalid) {
        return res.status(401).json({ message: "Petición no autorizada" });
      }

      if (!decodedToken.email) {
        return res.status(400).json({ message: "El token de usuario no contiene un email." });
      }

      user = await User.create({
        firebaseUid: decodedToken.uid,
        email: decodedToken.email,
        userName: decodedToken.name,
        role: (decodedToken.role as string) || "USER",
        is_active: true,
        blocked: false,
      });

      isNewUserFlag = true;
    }

    req.user = user;
    req.firebaseUser = decodedToken;
    req.isNewUser = isNewUserFlag;

    return next();
  } catch (error) {
    console.error("Error en el Middleware de Autorización:", error);
    return res.status(401).json({ message: "Petición no autorizada" });
  }
}
```

**Evidencia 2 — Middleware de control de acceso por roles (ADMIN):**

```typescript
// draftKings_api/middleware/auth.middleware.ts (líneas 153-163)
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user && req.user.role === "ADMIN") {
    return next();
  }

  return res.status(403).json({
    message: "Acceso denegado. Se requieren privilegios de Administrador.",
  });
}
```

**Evidencia 3 — Configuración de Firebase Admin SDK con sanitización de clave privada:**

```typescript
// draftKings_api/middleware/config/firebase.config.ts (líneas 1-41)
import * as admin from "firebase-admin";

let rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;

if (rawServiceAccount) {
  if (rawServiceAccount.startsWith("'") && rawServiceAccount.endsWith("'")) {
    rawServiceAccount = rawServiceAccount.slice(1, -1);
  }

  rawServiceAccount = rawServiceAccount.replace(
    /("private_key"\s*:\s*")([\s\S]*?)(")/,
    (match, openQuote, keyContent, closeQuote) => {
      const cleanKey = keyContent.replace(/\n/g, "\\n").replace(/\r/g, "\\r");
      return openQuote + cleanKey + closeQuote;
    },
  );
}

const serviceAccount = rawServiceAccount ? JSON.parse(rawServiceAccount) : undefined;

if (!serviceAccount) {
  console.error("Credenciales de Firebase no encontradas.");
} else {
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
}

export const authAdmin = admin.auth();
```

**Evidencia 4 — Configuración Swagger OpenAPI 3.0 con esquemas y seguridad:**

```typescript
// draftKings_api/swagger.config.ts (líneas 5-113)
const options: Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "DraftKings API",
      version: "1.0.0",
      description: "Documentación de la API de Draftkings...",
    },
    servers: [{ url: "http://localhost:3000", description: "Servidor de Desarrollo Node.js" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Player: { type: "object", properties: { id: { type: "string" }, name: { type: "string" } } },
        Review: { type: "object", properties: { id: { type: "string" }, user_id: { type: "string" } } },
        User: { type: "object", properties: { _id: { type: "string" }, email: { type: "string" } } },
        News: { type: "object", properties: { id: { type: "integer" }, fecha: { type: "string" } } },
      },
    },
  },
  apis: ["./draftKings_api/routes/*.ts", "./draftKings_api/controllers/*.ts"],
};

export const setupSwagger = (app: Express) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
```

**Evidencia 5 — Registro de Swagger y middlewares en app.ts:**

```typescript
// app.ts (líneas 75-87)
setupSwagger(app);

app.use("/", indexRouter);
app.use("/status", statusRouter);

app.use("/api/user", userApiRouter);
app.use("/api/players", playerApiRouter);
app.use("/api/reviews", reviewApiRouter);
app.use("/api/tactics", tacticRoutes);
app.use("/api/news", newsRoutes);
```

### Referencias

- `draftKings_api/middleware/auth.middleware.ts` — 3 middlewares de autorización (163 líneas)
- `draftKings_api/middleware/config/firebase.config.ts` — Configuración Firebase Admin SDK (41 líneas)
- `draftKings_api/middleware/types/express/index.d.ts` — Augmentación de tipos Express para `req.user`
- `draftKings_api/swagger.config.ts` — Configuración completa Swagger/OpenAPI 3.0 (113 líneas)
- `app.ts` — Montaje de Swagger UI y registro de rutas (líneas 75-87)

---

## 5. Testing de la API y control de errores (2 puntos)

### Evaluación/Justificación

El proyecto implementa una estrategia de testing completa con **12 archivos de test unitarios** y **6 de integración**, usando Jest + ts-jest + supertest + mongodb-memory-server. La cobertura incluye:

### 5.1 Conexión a la base de datos en tests
Se utiliza `mongodb-memory-server` para crear instancias MongoDB en memoria durante los tests de integración, evitando dependencia de una BD real. El helper `mongoTestDb.helper.ts` proporciona funciones reutilizables: `connectToInMemoryMongo()`, `disconnectInMemoryMongo()`, `clearCollections()`.

### 5.2 Control de errores en la API
Los controladores manejan explícitamente:
- **400 Bad Request**: `CastError` de Mongoose, `ValidationError`, parámetros inválidos, body incompleto
- **401 Unauthorized**: Token ausente/inválido/expirado (middleware)
- **403 Forbidden**: Rol insuficiente (middleware `requireAdmin`)
- **404 Not Found**: Documento no encontrado, usuario no registrado
- **500 Internal Server Error**: Errores inesperados de BD
- **503 Service Unavailable**: Fallos de conexión con APIs externas (API-Football, CORBA)

### 5.3 Pruebas unitarias
Tests puros con mocks de modelos y servicios (sin DB real). Cubren:
- Validación de entrada (campos requeridos, paginación, formatos)
- Lógica de controladores (respuestas correctas por escenario)
- Servicios externos (API-Football, CORBA, IA/LangChain)
- Serialización de modelos (toJSON transforms)

### 5.4 Pruebas de integración
Tests HTTP completos con supertest contra la app Express real:
- Autenticación mockada (middlewares de auth simulados con `jest.mock`)
- CRUD completo de Players, Reviews, Users, Tactics, News
- Verificación de códigos de estado HTTP
- Helpers de aserciones reutilizables (`expectUnauthorized`, `expectAdminForbidden`, `expectApiError`)

### Fragmentos de Código (Evidencias)

**Evidencia 1 — Configuración de base de datos en memoria para tests:**

```typescript
// draftKings_api/test/utils/helpers/mongoTestDb.helper.ts (líneas 1-26)
import mongoose, { type Model } from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

export const connectToInMemoryMongo = async (): Promise<MongoMemoryServer> => {
  const mongoServer = await MongoMemoryServer.create();

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  await mongoose.connect(mongoServer.getUri());
  return mongoServer;
};

export const disconnectInMemoryMongo = async (
  mongoServer: MongoMemoryServer,
): Promise<void> => {
  await mongoose.disconnect();
  await mongoServer.stop();
};

export const clearCollections = async (
  ...models: Array<Model<unknown>>
): Promise<void> => {
  await Promise.all(models.map(async (model) => model.deleteMany({})));
};
```

**Evidencia 2 — Test de integración con auth mockada y CRUD completo:**

```typescript
// draftKings_api/test/integration/player.int.test.ts (líneas 38-72, 102-168)
jest.mock("../../middleware/auth.middleware", () => ({
  authorizeRequest: jest.fn((req, res, next) => {
    if (!req.headers.authorization && !req.headers["x-test-role"]) {
      return res.status(401).json({ message: "Petición no autorizada" });
    }
    const role = req.headers["x-test-role"] === "ADMIN" ? "ADMIN" : "USER";
    req.user = { id: "mockUserId", role };
    next();
  }),
}));

describe("Player API Endpoints (/api/players)", () => {
  describe("POST /api/players (Crear Jugador)", () => {
    it("Debería retornar 401 si el usuario no está autenticado", async () => {
      const response = await request(app)
        .post("/api/players")
        .send(validPlayerBody);
      expectUnauthorized(response);
    });

    it("Debería crear un jugador correctamente y retornar 201", async () => {
      const response = await withAuth(request(app).post("/api/players")).send(validPlayerBody);
      expect(response.status).toBe(201);
      expect(response.body.name).toBe(validPlayerBody.name);
      expect(response.body.id).toBeDefined();
    });

    it("Debería retornar 400 si Mongoose lanza ValidationError", async () => {
      const response = await withAuth(request(app).post("/api/players")).send(invalidPlayerAgeBody);
      expectApiError(response, { status: 400, message: "Bad Request" });
    });
  });
});
```

**Evidencia 3 — Test unitario puro con mocks de dependencias:**

```typescript
// draftKings_api/test/unit/player.unit.test.ts (líneas 29-64)
jest.mock("../../models/player");
jest.mock("../../services/playerService");
jest.mock("../../services/apiFootballService");

describe("PlayerController (Pruebas Unitarias)", () => {
  beforeEach(() => {
    const ctx = createExpressMockContext();
    mockRequest = ctx.req;
    mockResponse = ctx.res;
    jest.clearAllMocks();
  });

  describe("playersReadAll", () => {
    it("Debería retornar 400 si los parámetros de paginación son inválidos", async () => {
      mockRequest.query = { page: "-1", size: "10" };
      await playersReadAll(mockRequest as Request, mockResponse as Response);
      expect(responseStatusMock).toHaveBeenCalledWith(400);
      expect(responseJsonMock).toHaveBeenCalledWith({
        message: "Parámetros de paginación inválidos",
      });
    });
  });
});
```

**Evidencia 4 — Helpers de aserciones reutilizables:**

```typescript
// draftKings_api/test/utils/helpers/apiAssertions.helper.ts (líneas 1-36)
export const expectApiError = (
  response: Response,
  expectation: ApiErrorExpectation,
): void => {
  expect(response.status).toBe(expectation.status);
  const responseMessage = String(response.body?.message ?? "");
  if (expectation.message instanceof RegExp) {
    expect(responseMessage).toMatch(expectation.message);
    return;
  }
  expect(responseMessage).toBe(expectation.message);
};

export const expectUnauthorized = (response: Response): void => {
  expectApiError(response, {
    status: 401,
    message: "Petición no autorizada",
  });
};

export const expectAdminForbidden = (response: Response): void => {
  expectApiError(response, {
    status: 403,
    message: "Acceso denegado. Se requieren privilegios de Administrador.",
  });
};
```

**Evidencia 5 — Configuración Jest con coverage y reporter JUnit:**

```javascript
// jest.config.js (líneas 1-32)
export default {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFiles: ["<rootDir>/test/setup-env.ts"],
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/dist/",
    "<rootDir>/coverage/",
  ],
  reporters: [
    "default",
    ["jest-junit", { outputDirectory: "coverage", outputName: "test.results.xml" }],
  ],
  collectCoverage: true,
  coverageDirectory: "coverage",
};
```

**Evidencia 6 — Conexión a BD en producción con manejo de errores y graceful shutdown:**

```typescript
// draftKings_api/models/database.ts (líneas 1-70)
const dbURI = process.env.BD_URI || "";
if (!dbURI) {
  console.error("Error: La variable de entorno BD_URI no está definida.");
  process.exit(1);
}

const options = {
  serverSelectionTimeoutMS: 30000,
  connectTimeoutMS: 30000,
  tlsAllowInvalidCertificates: false,
};

mongoose.connect(dbURI, options)
  .then(() => console.log("Mongoose connected successfully"))
  .catch((err) => console.error("Mongoose initial connection error:", err));

mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error:", err);
});

const gracefulShutdown = (msg: string, callback: () => void) => {
  mongoose.connection.close()
    .then(() => { console.log(`Mongoose disconnected through ${msg}`); callback(); })
    .catch((err) => { console.error("Error closing mongoose connection:", err); callback(); });
};

process.once("SIGUSR2", () => {
  gracefulShutdown("nodemon restart", () => { process.kill(process.pid, "SIGUSR2"); });
});
process.on("SIGINT", () => {
  gracefulShutdown("app termination", () => { process.exit(0); });
});
process.on("SIGTERM", () => {
  gracefulShutdown("Heroku app shutdown", () => process.exit(0));
});
```

### Referencias

- `draftKings_api/test/integration/player.int.test.ts` — Test de integración completo de jugadores (474 líneas)
- `draftKings_api/test/integration/reviews.int.test.ts` — Test de integración de reseñas
- `draftKings_api/test/integration/users.int.test.ts` — Test de integración de usuarios
- `draftKings_api/test/integration/tactics.int.test.ts` — Test de integración de tácticas
- `draftKings_api/test/integration/news.int.test.ts` — Test de integración de noticias
- `draftKings_api/test/unit/player.unit.test.ts` — Test unitario de controlador (398 líneas)
- `draftKings_api/test/unit/playerService.unit.test.ts` — Test unitario de servicio
- `draftKings_api/test/unit/review.unit.test.ts` — Test unitario de reseñas
- `draftKings_api/test/unit/user.unit.test.ts` — Test unitario de usuarios
- `draftKings_api/test/unit/tactic.unit.test.ts` — Test unitario de tácticas
- `draftKings_api/test/unit/aiTacticService.unit.test.ts` — Test unitario de servicio IA
- `draftKings_api/test/unit/apiFootballService.unit.test.ts` — Test unitario de API externa
- `draftKings_api/test/unit/modelSchemas.unit.test.ts` — Test de validación de esquemas
- `draftKings_api/test/unit/modelSerialization.unit.test.ts` — Test de serialización toJSON
- `draftKings_api/test/unit/newsService.unit.test.ts` — Test unitario de servicio noticias
- `draftKings_api/test/unit/newsModel.unit.test.ts` — Test unitario de modelo noticias
- `draftKings_api/test/unit/news.unit.test.ts` — Test unitario de controlador noticias
- `draftKings_api/test/utils/helpers/` — Helpers de testing (mongoTestDb, expressMock, mongooseQuery, entityFactory, authRequest, apiAssertions)
- `draftKings_api/test/utils/data/` — Datos de test (player, review, user, tactic, news, model, apiFootball)
- `jest.config.js` — Configuración Jest (32 líneas)
- `test/setup-env.ts` — Setup global de variables de entorno para tests

---

## 6. Panel de estado con Pug (Matrícula — Implementación adicional)

### Evaluación/Justificación

El proyecto implementa un **panel de estado del servidor** accesible en `/status`, renderizado con el motor de plantillas **Pug**. El panel muestra en tiempo real:

- **Estado de la conexión a MongoDB**: Lee `mongoose.connection.readyState` (0=Desconectado, 1=Conectado, 2=Conectando) y muestra un badge con color (verde/rojo/amarillo).
- **Tiempo de actividad (Uptime)**: Formateado en días, horas, minutos, segundos.
- **Entorno del servidor**: NODE_ENV, versión de Node.js, plataforma y arquitectura.
- **Uso de memoria**: Heap usado en MB, RAM total, RAM libre, con barra de progreso porcentual.
- **Número de cores CPU**.

La estructura de vistas sigue el patrón de herencia de Pug (`extends layout`) con un layout base que incluye Bootstrap 4.6.2, Bootswatch "Sketchy" theme, y Font Awesome 5.

### Fragmentos de Código (Evidencias)

**Evidencia 1 — Ruta del panel de estado con métricas del sistema:**

```typescript
// dashboard_server/routes/status.ts (líneas 1-64)
import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import os from "os";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  const dbStatusInt = mongoose.connection.readyState;
  let dbStatus = "Desconectado";
  let dbStatusClass = "badge-danger";

  if (dbStatusInt === 1) {
    dbStatus = "Conectado";
    dbStatusClass = "badge-success";
  } else if (dbStatusInt === 2) {
    dbStatus = "Conectando...";
    dbStatusClass = "badge-warning";
  }

  const uptimeSeconds = process.uptime();
  const uptimeString = formatUptime(uptimeSeconds);

  const memoryUsage = process.memoryUsage();
  const memoryUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
  const memoryTotalMB = Math.round(os.totalmem() / 1024 / 1024);
  const freeMemoryMB = Math.round(os.freemem() / 1024 / 1024);

  res.render("status", {
    title: "Panel de Estado — DraftKings REST API",
    status: {
      environment: process.env.NODE_ENV || "development",
      dbStatus,
      dbStatusClass,
      uptime: uptimeString,
      memoryUsed: memoryUsedMB,
      memoryTotal: memoryTotalMB,
      memoryFree: freeMemoryMB,
      nodeVersion: process.version,
      platform: os.platform(),
      arch: os.arch(),
      cpuCount: os.cpus().length,
      timestamp: new Date().toLocaleString(),
    },
  });
});
```

**Evidencia 2 — Plantilla Pug del panel de estado con Bootstrap:**

```pug
// dashboard_server/views/status.pug (líneas 1-100)
extends layout

block content
  .container.mt-5
    nav(aria-label="breadcrumb")
      ol.breadcrumb.bg-transparent.p-0.mb-4
        li.breadcrumb.item.mr-2
          a(href="/") <i class="fas fa-home"></i> Inicio
        li.breadcrumb.item.active(aria-current="page") &nbsp;/ Panel de Estado

    .d-flex.justify-content-between.align-items-center.mb-4
      h2.text-dark
        i.fas.fa-heartbeat.text-danger.mr-2
        | #{title}
      span.badge.badge-light.p-2.border.shadow-sm
        i.far.fa-clock.mr-1
        | Última actualización: #{status.timestamp}

    .row
      .col-md-6.col-lg-4.mb-4
        .card.h-100.shadow-sm
          .card-header.bg-white.font-weight-bold.d-flex.justify-content-between.align-items-center
            span <i class="fas fa-database text-info mr-2"></i> Base de Datos
            span(class=`badge ${status.dbStatusClass} p-2`)= status.dbStatus
          .card-body
            p.card-text.text-muted Estado actual de la conexión de persistencia...

      .col-md-6.col-lg-4.mb-4
        .card.h-100.shadow-sm
          .card-header.bg-white.font-weight-bold.d-flex.justify-content-between.align-items-center
            span <i class="fas fa-hourglass-start text-warning mr-2"></i> Tiempo Activo
            span.badge.badge-warning.p-2 En Línea
          .card-body.text-center.d-flex.flex-column.justify-content-center
            h3.display-4.text-primary.my-2= status.uptime

    .card.shadow-sm.mb-5
      .card-header.bg-light.font-weight-bold
        i.fas.fa-microchip.text-success.mr-2
        | Recursos de Memoria del Sistema
      .card-body
        .row.align-items-center
          .col-md-4.text-center.mb-3.mb-md-0
            h4 Uso de Memoria Heap (Node)
            h2.text-success.display-4= status.memoryUsed
              span.h4.text-muted  MB
          .col-md-8
            .progress.mb-3(style="height: 25px;")
              - var percentUsed = Math.round((status.memoryUsed / status.memoryTotal) * 100)
              .progress-bar.progress-bar-striped.progress-bar-animated.bg-success(role="progressbar" style=`width: ${percentUsed}%` ...) #{percentUsed}% Utilizado
```

**Evidencia 3 — Layout base con Bootstrap y herencia de Pug:**

```pug
// dashboard_server/views/layout.pug (líneas 1-10)
doctype html
html
  head
    title= title
    link(rel='stylesheet', href='https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css', ...)
    link(rel='stylesheet', href='https://cdnjs.cloudflare.com/ajax/libs/bootswatch/4.6.2/sketchy/bootstrap.min.css')
    link(rel='stylesheet', href='/stylesheets/style.css')
    link(rel='stylesheet', href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css')
  body
    block content
```

**Evidencia 4 — Registro de rutas del dashboard en app.ts:**

```typescript
// app.ts (líneas 30-31, 78-79)
app.set("views", path.join(__dirname, "dashboard_server/views"));
app.set("view engine", "pug");

app.use("/", indexRouter);
app.use("/status", statusRouter);
```

### Referencias

- `dashboard_server/routes/status.ts` — Ruta del panel de estado (64 líneas)
- `dashboard_server/views/status.pug` — Plantilla del panel de estado (100 líneas)
- `dashboard_server/views/layout.pug` — Layout base con Bootstrap (10 líneas)
- `dashboard_server/views/index.pug` — Página principal del dashboard (69 líneas)
- `dashboard_server/views/error.pug` — Página de errores
- `app.ts` — Configuración de Pug como view engine y registro de rutas (líneas 30-31, 78-79)

---

## Resumen de Puntuación

| Criterio | Puntos Máx. | Puntos Obtenidos | Estado |
|----------|:-----------:|:-----------------:|:------:|
| 1. Servicio Web de carga de datos (API externa → MongoDB) | 2 | 2 | ✅ |
| 2. Modelo de datos Mongoose (esquema principal + anidados) | 2 | 2 | ✅ |
| 3. API REST — Rutas parametrizadas + CRUD docs principales y anidados | 3 | 3 | ✅ |
| 4. Seguridad JWT + Documentación Swagger | 1 | 1 | ✅ |
| 5. Testing + Control de errores | 2 | 2 | ✅ |
| **Total** | **10** | **10** | ✅ |
| Matrícula: Panel de estado con Pug | Bonus | ✅ | Implementado |

**Calificación final: 10/10 + Matrícula**
