# 📋 Especificación de la API REST — DraftKings

## 🔐 Autenticación y Usuarios

### 1) Sincronizar / Registrar Usuario
- **Caso de uso:** `UC_registrar`
- **Descripción:** Registra al usuario en la base de datos interna usando el UID y el email extraídos del token JWT.
- **Método:** `POST`
- **URL:** `http://localhost:8092/api/auth/sync-user`
- **Headers:**
  - `Authorization: Bearer {tu_token_JWT}`
  - `Content-Type: application/json`
- **Body (JSON):**

```json
{
  "userName": "nombreDeUsuario"
}
```

- **Respuestas:**
  - `201 Created` — Usuario sincronizado correctamente.
  - `400 Bad Request` — Nombre de usuario en uso o faltan parámetros.
  - `401 Unauthorized` — Firebase token inválido o expirado.

### 2) Obtener perfil del usuario autenticado
- **Caso de uso:** `UC_iniciar_sesion`
- **Descripción:** Devuelve la información del usuario actualmente autenticado a partir del JWT.
- **Método:** `GET`
- **URL:** `http://localhost:8092/api/auth/me`
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
  "created_at": "2026-05-21T11:55:00Z"
}
```
  - `401 Unauthorized` — Token inválido o expirado.

---

## ⚽ Jugadores (Player CRUD)

### 3) Obtener listado de jugadores
- **Casos de uso:** `UC_ver_listado`, `UC_buscar`, `UC_filtro_nombre`, `UC_filtro_fecha`, `UC_filtro_equipo`
- **Descripción:** Lista paginada de jugadores con filtros por query params.
- **Método:** `GET`
- **URL:** `http://localhost:8092/api/players`
- **Headers:**
  - `Authorization: Bearer {tu_token_JWT}` (requerido para Usuario Común o superior)
- **Query parameters (opcionales):**
  - `search` — texto libre para buscar por nombre
  - `team` — filtrar por equipo
  - `league` — filtrar por liga
  - `startDate` — filtrar por fecha de alta desde (ISO)
- **Respuestas:**
  - `200 OK` — Ejemplo:

```json
[
  {
    "id": 12,
    "name": "Cristiano Ronaldo",
    "position": "Delantero",
    "number": 7,
    "team": "Al-Nassr",
    "photoUrl": "https://cdn.example.com/cr7.png"
  }
]
```

### 4) Obtener detalle de un jugador
- **Caso de uso:** `UC_ver_detalles`
- **Descripción:** Devuelve toda la información de un jugador por ID.
- **Método:** `GET`
- **URL:** `http://localhost:8092/api/players/{id}`
- **Headers:**
  - `Authorization: Bearer {tu_token_JWT}`
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
  "weight": 83.50,
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
  - `404 Not Found` — Jugador no existe.

### 5) Crear un jugador (formulario interno)
- **Caso de uso:** `UC_añadir_nuevo` (incluye `UC_obtener_geo` y `UC_añadir_imagen`)
- **Descripción:** Registrar un nuevo jugador manualmente.
- **Método:** `POST`
- **URL:** `http://localhost:8092/api/players`
- **Headers:**
  - `Authorization: Bearer {tu_token_JWT}` (Solo Usuario Registrado o superior)
  - `Content-Type: application/json`
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
  "weight": 66.00,
  "number": 19,
  "team": "FC Barcelona",
  "league": "LaLiga",
  "position": "Extremo",
  "photoUrl": "https://cdn.example.com/lamine.png",
  "latitude": 41.3809,
  "longitude": 2.1228
}
```

*- **Respuestas:***
  - `201 Created` — Jugador creado con éxito.

### 6) Importar jugador desde API externa
- **Caso de uso:** `UC_añadir_existente` (incluye `UC_seleccionar_api`)
- **Descripción:** Importa un jugador desde un servicio externo a la BD local.
- **Método:** `POST`
- **URL:** `http://localhost:8092/api/players/import-external`
- **Headers:**
  - `Authorization: Bearer {tu_token_JWT}` (Solo Usuario Registrado o superior)
  - `Content-Type: application/json`
- **Body (JSON):**

```json
{
  "external_api_id": "api_football_9410",
  "latitude": 48.8566,
  "longitude": 2.3522
}
```

- **Respuestas:**
  - `201 Created` — Jugador importado y geolocalizado correctamente.

### 7) Editar datos de un jugador
- **Caso de uso:** `UC_editar_jugador` (puede incluir `UC_editar_geo`)
- **Descripción:** Actualiza campos de un jugador existente.
- **Método:** `PUT`
- **URL:** `http://localhost:8092/api/players/{id}`
- **Headers:**
  - `Authorization: Bearer {tu_token_JWT}` (Exclusivo de Usuario Administrador)
  - `Content-Type: application/json`
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

- **Respuestas:**
  - `200 OK` — Modificación procesada con éxito.

### 8) Eliminar un jugador
- **Caso de uso:** `UC_eliminar_jugador`
- **Descripción:** Borra un jugador permanentemente.
- **Método:** `DELETE`
- **URL:** `http://localhost:8092/api/players/{id}`
- **Headers:**
  - `Authorization: Bearer {tu_token_JWT}` (Exclusivo de Usuario Administrador)
- **Respuestas:**
  - `204 No Content` — Eliminación exitosa.

---

## 💬 Comentarios y Reseñas (Review CRUD)

### 9) Obtener comentarios de un jugador
- **Caso de uso:** `UC_ver_comentarios` (incluido en `UC_ver_detalles`)
- **Descripción:** Devuelve todas las reseñas para un jugador.
- **Método:** `GET`
- **URL:** `http://localhost:8092/api/players/{player_id}/reviews`
- **Headers:**
  - `Authorization: Bearer {tu_token_JWT}`
- **Respuestas:**
  - `200 OK` — Ejemplo:

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

### 10) Crear un comentario para un jugador
- **Caso de uso:** `UC_crear_comentario` (incluye `UC_obtener_geo`)
- **Descripción:** Añade una reseña con texto, puntuación y ubicación.
- **Método:** `POST`
- **URL:** `http://localhost:8092/api/players/{player_id}/reviews`
- **Headers:**
  - `Authorization: Bearer {tu_token_JWT}`
  - `Content-Type: application/json`
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

- **Respuestas:**
  - `201 Created` — Comentario añadido con éxito.

### 11) Editar comentario (UNUSED)
- **Caso de uso:** `UC_editar_comentario`
- **Descripción:** Edita el texto y/o la puntuación de una reseña existente. (Endpoint marcado como `unused`)
- **Método:** `PUT`
- **URL:** `http://localhost:8092/api/reviews/{id}`
- **Headers:**
  - `Authorization: Bearer {tu_token_JWT}`
  - `Content-Type: application/json`
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
  - `404 Not Found` — Comentario no existe.

### 12) Eliminar comentario
- **Caso de uso:** `UC_eliminar_comentario`
- **Descripción:** Elimina una reseña (moderación).
- **Método:** `DELETE`
- **URL:** `http://localhost:8092/api/reviews/{id}`
- **Headers:**
  - `Authorization: Bearer {tu_token_JWT}` (Exclusivo de Usuario Administrador)
- **Respuestas:**
  - `204 No Content` — Comentario eliminado.

---

## 📰 Noticias (News System)

<!-- TO DO -->   
### 12) Obtener noticias de jugadores
- **Caso de uso:** `UC_ver_noticias`
- **Método:** `GET`
- **URL:** `http://localhost:8092/api/news`
- **Headers:**
  - `Authorization: Bearer {tu_token_JWT}`

### 13) Publicar una noticia
- **Caso de uso:** `UC_crear_noticia`
- **Método:** `POST`
- **URL:** `http://localhost:8092/api/news`
- **Headers:**
  - `Authorization: Bearer {tu_token_JWT}` (Exclusivo de Usuario Administrador)
  - `Content-Type: application/json`
- **Body (JSON) ejemplo:**

```json
{
  "title": "Fichaje Bomba en la liga",
  "summary": "Resumen corto de la noticia",
  "body": "Texto largo con todo el desarrollo informativo...",
  "player_id": 12,
  "tags": "Fichajes, Exclusiva"
}
```

---

## 🏆 Tácticas (Equipo Ideal)
<!-- TO DO -->

### 14) Guardar / Actualizar alineación del Equipo Ideal
- **Caso de uso:** `UC_generar_equipo`
- **Descripción:** Almacena la disposición de los 11 jugadores seleccionados por el usuario.
- **Método:** `PUT`
- **URL:** `http://localhost:8092/api/squad/ideal-team`
- **Headers:**
  - `Authorization: Bearer {tu_token_JWT}` (Solo Usuario Registrado o superior)
  - `Content-Type: application/json`
- **Body (JSON) ejemplo:**

```json
{
  "formation": "4-3-3",
  "lineup": [
    { "player_id": 12, "position_on_pitch": "LW" },
    { "player_id": 5, "position_on_pitch": "GK" }
  ]
}
```

---