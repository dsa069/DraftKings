# 📋 Especificación de la API REST — DraftKings

## Documentación Swagger

- **Spring**
  - Player microservice: `http://localhost:8090/swagger-ui/index.html`
  - Review microservice: `http://localhost:8091/swagger-ui/index.html`
  - User microservice: `http://localhost:8092/swagger-ui/index.html`

- **Node**
  - `http://localhost:3000/api-docs/`

## 🔐 Autenticación y Usuarios

### 1) Sincronizar / Registrar Usuario

- **Caso de uso:** `UC_registrar`
- **Descripción:** Registra al usuario en la base de datos interna usando el UID y el email extraídos del token JWT.
- **Método:** `POST`
- **URL:**
  - Spring: `http://localhost:8080/userms/api/auth/sync-user`
  - Node: `http://localhost:3000/api/user/sync`
- **Headers:**
  - `Authorization: Bearer {tu_token_JWT}`
  - `Content-Type: application/json`
- **Body (JSON):**

```json
{
  "userName": "nombreDeUsuario",
  "role": "USER"
}
```

- **Campos:**
  - `userName` — nombre de usuario a registrar.
  - `role` — opcional; si no se envía o no es válido, el backend asigna `USER`.

- **Respuestas:**
  - `200 OK` — Usuario sincronizado y registrado con éxito en PostgreSQL.
  - `401 Unauthorized` — El token de autenticación falta o no es válido.
  - `409 Conflict` — El usuario ya se encuentra sincronizado.
  - `500 Internal Server Error` — Error interno del servidor inesperado.

### 2) Obtener perfil del usuario autenticado

- **Caso de uso:** `UC_iniciar_sesion`
- **Descripción:** Devuelve la información del usuario actualmente autenticado a partir del JWT.
- **Método:** `GET`
- **URL:**
  - Spring: `http://localhost:8080/userms/api/auth/me`
  - Node: `http://localhost:3000/api/user/profile`
- **Headers:**
  - `Authorization: Bearer {tu_token_JWT}`
- **Respuestas:**
  - `200 OK` — Ejemplo de respuesta:

```json
{
  "id": 1,
  "email": "usuario@ejemplo.com",
  "userName": "nombreDeUsuario",
  "role": "USER",
  "firebaseUid": "uid-de-firebase",
  "created_at": "2026-05-21T11:55:00Z"
}
```

- `401 Unauthorized` — El token JWT de autenticación falta o expiró.
- `404 Not Found` — Usuario no localizado en la base de datos.
- `500 Internal Server Error` — Error interno del servidor.

---

## ⚽ Jugadores (Player CRUD)

### 3) Obtener listado de jugadores

- **Casos de uso:** `UC_ver_listado`, `UC_buscar`, `UC_filtro_nombre`, `UC_filtro_fecha`, `UC_filtro_equipo`
- **Descripción:** Lista paginada de jugadores con filtros por query params.
- **Método:** `GET`
- **URL:**
  - Spring: `http://localhost:8080/playerms/api/players`
  - Node: `http://localhost:3000/api/players`

- **Query parameters (opcionales):**
  - `search` — texto libre para buscar por nombre
  - `team` — filtrar por equipo
  - `league` — filtrar por liga
  - `startDate` — filtrar por fecha de alta desde (ISO)
  - `page` — número de página, `0` o superior
  - `size` — tamaño de página, mayor que `0`
- **Respuestas:**
  - `200 OK` — Respuesta paginada:
    - Spring:

```json
{
  "content": [
    {
      "id": 12,
      "name": "Cristiano Ronaldo",
      "position": "Delantero",
      "number": 7,
      "team": "Al-Nassr",
      "photoUrl": "https://cdn.example.com/cr7.png"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10
  },
  "totalElements": 1,
  "totalPages": 1,
  "last": true
}
```

    - Node:

```json
{
  "content": [
    {
      "id": 12,
      "name": "Cristiano Ronaldo",
      "position": "Delantero",
      "number": 7,
      "team": "Al-Nassr",
      "photoUrl": "https://cdn.example.com/cr7.png"
    }
  ],
  "totalElements": 1,
  "totalPages": 1,
  "number": 0,
  "size": 10
}
```

- `400 Bad Request` — Parámetros de paginación inválidos.
- `500 Internal Server Error` — Error interno inesperado.

### 4) Obtener detalle de un jugador

- **Caso de uso:** `UC_ver_detalles`
- **Descripción:** Devuelve toda la información de un jugador por ID.
- **Método:** `GET`
- **URL:**
  - Spring: `http://localhost:8080/playerms/api/players/{id}`
  - Node: `http://localhost:3000/api/players/{id}`
- **Respuestas:**
  - `200 OK` — Ejemplo:

```json
{
  "id": 12,
  "name": "Cristiano Ronaldo",
  "firstName": "Cristiano",
  "lastName": "Ronaldo",
  "age": 41,
  "birthdate": "1985-02-05",
  "nationality": "Portugués",
  "height": 1.87,
  "weight": 83.5,
  "number": 7,
  "team": "Al-Nassr",
  "league": "Saudi Pro League",
  "position": "Delantero",
  "photoUrl": "https://cdn.example.com/cr7.png",
  "latitude": 24.7136,
  "longitude": 46.6753,
  "created_at": "2026-01-15T08:30:00Z"
}
```

- `400 Bad Request` — Identificador no válido.
- `404 Not Found` — Jugador no existe.
- `500 Internal Server Error` — Error interno inesperado.

### 5) Crear un jugador (formulario interno)

- **Caso de uso:** `UC_añadir_nuevo` (incluye `UC_obtener_geo` y `UC_añadir_imagen`)
- **Descripción:** Registrar un nuevo jugador manualmente.
- **Método:** `POST`
- **URL:**
  - Spring: `http://localhost:8080/playerms/api/players`
  - Node: `http://localhost:3000/api/players`
- **Headers:**
  - `Authorization: Bearer {tu_token_JWT}` (Solo Usuario Registrado o superior)
- **Content-Type:** `application/json`
- **Body (JSON):**

```json
{
  "name": "Lamine Yamal",
  "firstName": "Lamine",
  "lastName": "Yamal",
  "age": 18,
  "birthdate": "2007-07-13",
  "nationality": "Española",
  "height": 1.78,
  "weight": 66.0,
  "number": 19,
  "team": "FC Barcelona",
  "league": "LaLiga",
  "position": "Extremo",
  "photoUrl": "https://cdn.example.com/lamine.png",
  "latitude": 41.3809,
  "longitude": 2.1228
}
```

- **Campos requeridos:** `name`, `latitude`, `longitude`.
- **Campos opcionales:** `firstName`, `lastName`, `age`, `birthdate`, `nationality`, `height`, `weight`, `number`, `team`, `league`, `position`, `photoUrl`.
- **Nota:** `createdAt` se asigna automáticamente si no llega en el body.

- **Respuestas:**
  - `201 Created` — Jugador creado con éxito.
  - `401 Unauthorized` — El token JWT falta o no es válido.
  - `400 Bad Request` — Body inválido.
  - `500 Internal Server Error` — Error interno inesperado.

### 6) Obtener jugadores desde la API externa

- **Caso de uso:** `UC_buscar_externo`
- **Descripción:** Consulta la API de API-Football y devuelve una lista normalizada de jugadores según el texto de búsqueda.
- **Método:** `GET`
- **URL:**
  - Spring: `http://localhost:8080/playerms/api/players/external`
  - Node: `http://localhost:3000/api/players/external`
- **Headers:**
  - `Authorization: Bearer {tu_token_JWT}`

- **Query parameters (opcionales):**
  - `search` — texto libre para buscar jugadores por nombre en la API externa

- **Ejemplo de llamada:**

```http
GET http://localhost:8080/playerms/api/players/external?search=ronaldo
```

- **Respuestas:**
  - `200 OK` — Lista normalizada de jugadores:

```json
[
  {
    "name": "Cristiano Ronaldo",
    "firstName": "Cristiano",
    "lastName": "Ronaldo",
    "age": 41,
    "birthdate": "1985-02-05",
    "nationality": "Portugal",
    "position": "Attacker",
    "photoUrl": "https://media.api-sports.io/football/players/874.png",
    "team": "API Football",
    "league": "External",
    "latitude": 0,
    "longitude": 0,
    "height": "187 cm",
    "weight": "83 kg",
    "number": 7
  }
]
```

- `401 Unauthorized` — El token JWT falta o no es válido.
- `503 Service Unavailable` — Error de comunicación o timeout con la API externa.
- `500 Internal Server Error` — Error consultando la API externa.

### 7) Importar jugadores desde la API externa

- **Caso de uso:** `UC_importar_externo`
- **Descripción:** Recibe un array de jugadores ya normalizados y los inserta en MongoDB.
- **Método:** `POST`
- **URL:**
  - Spring: `http://localhost:8080/playerms/api/players/import`
  - Node: `http://localhost:3000/api/players/import`
- **Headers:**
  - `Authorization: Bearer {tu_token_JWT}`
- **Content-Type:** `application/json`

- **Body (JSON):**

```json
[
  {
    "name": "Cristiano Ronaldo",
    "firstName": "Cristiano",
    "lastName": "Ronaldo",
    "age": 41,
    "birthdate": "1985-02-05",
    "nationality": "Portugal",
    "position": "Attacker",
    "photoUrl": "https://media.api-sports.io/football/players/874.png",
    "team": "API Football",
    "league": "External",
    "latitude": 24.7136,
    "longitude": 46.6753,
    "height": "187 cm",
    "weight": "83 kg",
    "number": 7
  }
]
```

- **Notas del body:**
  - El body debe ser un array JSON, no un objeto suelto.
  - Cada elemento debe incluir al menos `name`, `latitude` y `longitude`.
  - `createdAt` se asigna automáticamente si no viene informado.

- **Respuestas:**
  - `201 Created` — Jugadores importados correctamente.
  - `401 Unauthorized` — El token JWT falta o no es válido.
  - `400 Bad Request` — El body no es un array de jugadores.
  - `500 Internal Server Error` — Error al insertar en base de datos.

### 8) Editar datos de un jugador

- **Caso de uso:** `UC_editar_jugador` (puede incluir `UC_editar_geo`)
- **Descripción:** Actualiza campos de un jugador existente.
- **Método:** `PUT`
- **URL:**
  - Spring: `http://localhost:8080/playerms/api/players/{id}`
  - Node: `http://localhost:3000/api/players/{id}`
- **Headers:**
  - `Authorization: Bearer {tu_token_JWT}` (Exclusivo de Usuario Administrador)
- **Content-Type:** `application/json`
- **Body (JSON) ejemplo:**

```json
{
  "team": "Paris Saint-Germain",
  "league": "Ligue 1",
  "number": 10,
  "latitude": 48.8415,
  "longitude": 2.253
}
```

- **Campos editables:** `team`, `league`, `number`, `latitude`, `longitude`, `name`, `position`, `photoUrl`, `firstName`, `lastName`, `age`, `birthdate`, `nationality`, `height`, `weight`.
- **Nota:** la actualización es parcial; solo se cambian los campos no nulos.

- **Respuestas:**
  - `200 OK` — Modificación procesada con éxito.
  - `400 Bad Request` — El identificador no es válido o no se pudo interpretar como ObjectId.
  - `401 Unauthorized` — El token JWT falta o no es válido.
  - `403 Forbidden` — El usuario autenticado no tiene permisos de administrador.
  - `404 Not Found` — Jugador no encontrado.
  - `500 Internal Server Error` — Error interno inesperado.

### 9) Eliminar un jugador

- **Caso de uso:** `UC_eliminar_jugador`
- **Descripción:** Borra un jugador permanentemente.
- **Método:** `DELETE`
- **URL:**
  - Spring: `http://localhost:8080/playerms/api/players/{id}`
  - Node: `http://localhost:3000/api/players/{id}`
- **Headers:**
  - `Authorization: Bearer {tu_token_JWT}` (Exclusivo de Usuario Administrador)
- **Respuestas:**
  - `204 No Content` — Eliminación exitosa.
  - `400 Bad Request` — El identificador no es válido o no se pudo interpretar como ObjectId.
  - `401 Unauthorized` — El token JWT falta o no es válido.
  - `403 Forbidden` — El usuario autenticado no tiene permisos de administrador.
  - `404 Not Found` — Jugador no encontrado.
  - `500 Internal Server Error` — Error interno inesperado.

---

## 💬 Comentarios y Reseñas (Review CRUD)

### 10) Obtener comentarios de un jugador

- **Caso de uso:** `UC_ver_comentarios` (incluido en `UC_ver_detalles`)
- **Descripción:** Devuelve todas las reseñas para un jugador.
- **Método:** `GET`
- **URL:**
  - Spring: `http://localhost:8080/playerms/api/players/{player_id}/reviews`
  - Node: `http://localhost:3000/api/players/{player_id}/reviews`
- **Respuestas:**
  - `200 OK` — Lista de reseñas del jugador:

```json
[
  {
    "id": 45,
    "user_id": 3,
    "author": "JuanGamer",
    "text": "Increíble rendimiento en el partido de ayer.",
    "rating": 5,
    "latitude": 40.4167,
    "longitude": -3.7037,
    "created_at": "2026-05-20T18:22:00Z"
  }
]
```

- `400 Bad Request` — Identificador de jugador inválido.
- `404 Not Found` — Jugador no encontrado.
- `500 Internal Server Error` — Error interno inesperado.

### 11) Crear un comentario para un jugador

- **Caso de uso:** `UC_crear_comentario` (incluye `UC_obtener_geo`)
- **Descripción:** Añade una reseña con texto, puntuación y ubicación.
- **Método:** `POST`
- **URL:**
  - Spring: `http://localhost:8080/playerms/api/players/{player_id}/reviews`
  - Node: `http://localhost:3000/api/players/{player_id}/reviews`
- **Body (JSON) ejemplo:**

```json
{
  "author": "AnalistaFutbol",
  "text": "Ha bajado un poco su ritmo físico en los últimos minutos de juego.",
  "rating": 3,
  "latitude": 37.3891,
  "longitude": -5.9845
}
```

- **Campos requeridos:** `text`, `rating`.
- **Campos opcionales:** `author`, `latitude`, `longitude`.
- **Nota:** `userId` y `playerId` se asignan desde el backend.

- **Respuestas:**
  - `201 Created` — Comentario añadido con éxito.
  - `400 Bad Request` — Body de la reseña inválido o incompleto.
  - `503 Service Unavailable` — Servicio de reseñas no disponible.
  - `500 Internal Server Error` — Error interno inesperado.

### 12) Editar comentario

- **Caso de uso:** `UC_editar_comentario`
- **Descripción:** Edita el texto y/o la puntuación de una reseña existente.
- **Método:** `PUT`
- **URL:**
  - Spring: `http://localhost:8080/reviewms/api/reviews/{id}`
  - Node: `http://localhost:3000/api/reviews/{id}`
- **Headers:**
  - `Authorization: Bearer {tu_token_JWT}` (Exclusivo de Usuario Administrador)
- **Content-Type:** `application/json`
- **Body (JSON) ejemplo:**

```json
{
  "text": "Comentario corregido...",
  "rating": 4
}
```

- **Tags:** `unused`
- **Respuestas:**
  - `200 OK` — Comentario actualizado.
  - `400 Bad Request` — El identificador no es válido, el body está vacío o no contiene campos editables.
  - `401 Unauthorized` — El token JWT falta o no es válido.
  - `403 Forbidden` — El usuario autenticado no tiene permisos de administrador.
  - `404 Not Found` — Comentario no existe.
  - `500 Internal Server Error` — Error interno inesperado.

### 13) Eliminar comentario

- **Caso de uso:** `UC_eliminar_comentario`
- **Descripción:** Elimina una reseña (moderación).
- **Método:** `DELETE`
- **URL:**
  - Spring: `http://localhost:8080/reviewms/api/reviews/{id}`
  - Node: `http://localhost:3000/api/reviews/{id}`
- **Headers:**
  - `Authorization: Bearer {tu_token_JWT}` (Exclusivo de Usuario Administrador)
- **Respuestas:**
  - `204 No Content` — Comentario eliminado.
  - `400 Bad Request` — El identificador no es válido o no se pudo interpretar como ObjectId.
  - `401 Unauthorized` — El token JWT falta o no es válido.
  - `403 Forbidden` — El usuario autenticado no tiene permisos de administrador.
  - `404 Not Found` — Comentario no existe.
  - `500 Internal Server Error` — Error interno inesperado.

---

## 📰 Noticias (News System)

### 14) Obtener noticias de jugadores

- **Caso de uso:** `UC_ver_noticias`

- **Método:** `GET`

- **URL:**
  - Spring: `http://localhost:8080/playerms/api/news`
  - Node: `http://localhost:3000/api/news`

- **Headers:**
  - `Authorization: Bearer {tu_token_JWT}`

- **Respuesta 200 (JSON) ejemplo:**

```json
[
  {
    "id": 0,
    "fecha": "15/04/2026",
    "jugador": "Lamine Yamal",
    "interes": "alta",
    "titulo": "Lamine Yamal vuelve a ser decisivo en la lucha por el campeonato",
    "descripcion": "El joven extremo fue protagonista en la última jornada tras participar directamente en dos goles, aumentando su valor para los usuarios fantasy y confirmando su gran estado de forma.",
    "etiquetas": ["#LaLiga", "#LamineYamal", "#Fantasy"]
  }
]
```

- **Respuestas:**
  - `200 OK` — Lista de noticias devuelta correctamente.
  - `401 Unauthorized` — El token JWT falta o no es válido.
  - `500 Internal Server Error` — Error al comunicarse con el sistema de noticias.
  - `503 Service Unavailable` — El sistema externo de noticias (CORBA) no está disponible.

---

### 15) Ver noticia en detalle

- **Caso de uso:** `UC_ver_noticia`

- **Método:** `GET`

- **URL:**
  - Spring: `http://localhost:8080/playerms/api/news/{id}`
  - Node: `http://localhost:3000/api/news/{id}`

- **Headers:**
  - `Authorization: Bearer {tu_token_JWT}`

- **Respuesta 200 (JSON) ejemplo:**

```json
{
  "id": 0,
  "fecha": "15/04/2026",
  "jugador": "Lamine Yamal",
  "interes": "alta",
  "titulo": "Lamine Yamal vuelve a ser decisivo en la lucha por el campeonato",
  "descripcion": "El joven extremo fue protagonista en la última jornada tras participar directamente en dos goles, aumentando su valor para los usuarios fantasy y confirmando su gran estado de forma.",
  "etiquetas": ["#LaLiga", "#LamineYamal", "#Fantasy"]
}
```

- **Respuestas:**
  - `200 OK` — Noticia encontrada.
  - `400 Bad Request` — El ID de la noticia debe ser válido.
  - `401 Unauthorized` — El token JWT falta o no es válido.
  - `404 Not Found` — La noticia no existe.
  - `500 Internal Server Error` — Error al comunicarse con el sistema de noticias.
  - `503 Service Unavailable` — El sistema externo de noticias (CORBA) no está disponible.

---

### 16) Publicar una noticia

- **Caso de uso:** `UC_crear_noticia`

- **Método:** `POST`

- **URL:**
  - Spring: `http://localhost:8080/playerms/api/news`
  - Node: `http://localhost:3000/api/news`

- **Headers:**
  - `Authorization: Bearer {tu_token_JWT}` (Exclusivo de Usuario Administrador)
  - `Content-Type: application/json`

- **Body (JSON) ejemplo:**

```json
{
  "id": 0,
  "fecha": "15/04/2026",
  "jugador": "Lamine Yamal",
  "interes": "alta",
  "titulo": "Lamine Yamal vuelve a ser decisivo en la lucha por el campeonato",
  "descripcion": "El joven extremo fue protagonista en la última jornada tras participar directamente en dos goles, aumentando su valor para los usuarios fantasy y confirmando su gran estado de forma.",
  "etiquetas": ["#LaLiga", "#LamineYamal", "#Fantasy"]
}
```

- **Respuestas:**
  - `201 Created` — Noticia publicada correctamente.
  - `400 Bad Request` — Body inválido.
  - `401 Unauthorized` — El token JWT falta o no es válido.
  - `403 Forbidden` — El usuario autenticado no tiene permisos de administrador.
  - `500 Internal Server Error` — Error publicando la noticia en el sistema externo.
  - `503 Service Unavailable` — El sistema externo de noticias (CORBA) no está disponible.

---

## 🏆 Tácticas (Equipo Ideal)

### 16) Obtener recomendaciones de la IA para completar alineación

- **Caso de uso:** `UC_recomendar_jugadores_ia`
- **Descripción:** Procesa las posiciones actuales mediante una IA para sugerir jugadores para las posiciones vacías.
- **Método:** `POST`
- **URL:**
  - Spring: `http://localhost:8080/playerms/api/tactics/recommendations`
  - Node: `http://localhost:3000/api/tactics/recommendations`
- **Headers:**
  - `Authorization: Bearer {tu_token_JWT}`
  - `Content-Type: application/json`
- **Body (JSON):**

```json
{
  "positions": {
    "PO": "Thibaut Courtois",
    "DFI": null,
    "DFC1": "Ronald Araújo",
    "DFC2": "Virgil van Dijk",
    "DFD": "Achraf Hakimi",
    "MC1": "Pedri",
    "MC2": null,
    "MCO": "Lionel Messi",
    "EI": null,
    "ED": "Mohamed Salah",
    "DC": "Erling Haaland"
  }
}
```

- **Campos:**
  - `positions` — objeto con las posiciones del campo como claves y el nombre del jugador asignado o `null` como valor.

- **Respuestas:**
  - `200 OK` — Recomendaciones generadas con éxito.

```json
{
  "message": "Analizando tu bloque defensivo liderado por Van Dijk y la potencia ofensiva de Haaland, la IA sugiere incorporar un lateral izquierdo con proyección de ataque y un mediocentro organizador clásico para equilibrar las transiciones de tu esquema 4-3-3.",
  "recommendations": {
    "DFI": "Alphonso Davies",
    "MC2": "Kevin De Bruyne",
    "EI": "Kylian Mbappé"
  }
}
```

- `400 Bad Request` — El formato del mapa de posiciones es inválido o no se han enviado datos.
- `401 Unauthorized` — El token JWT falta o no es válido.
- `503 Service Unavailable` — Error de comunicación o timeout con el proveedor del servicio de Inteligencia Artificial.
- `500 Internal Server Error` — Error interno del servidor.
