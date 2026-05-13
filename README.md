# DraftKings ⚽

![Logo de la App](https://via.placeholder.com/150) ## 📝 Introducción
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
**Mencionar Actions para cada sección**
### **Frontend**
- **Angular** El proyecto se forma de Standalone components
- **Ionic Framework:** Desarrollo de la aplicación híbrida para garantizar una experiencia nativa en iOS y Android.
- **Capacitor:** Para el acceso a hardware nativo (Cámara y GPS).
- **Componentes UI:** Diseño basado en componentes deportivos de alto rendimiento.

### **Backend (Microservicios / Servicios Distribuidos)**
- **Node.js:** Encargado de [mencionar función, ej: la lógica de noticias y tiempo real].
- **Spring Boot (Java):** Encargado de [mencionar función, ej: la gestión robusta de jugadores y autenticación].
- **Mencionar diagramas**
- **Mencionar arquietctura springBoot**

### **Comunicación y Persistencia**
- **CORBA (Common Object Request Broker Architecture):** Utilizado como middleware para la interoperabilidad entre objetos distribuidos en una red heterogénea.
- **ORB (Object Request Broker):** Facilitador de la comunicación entre los servicios de backend y el almacenamiento de datos.

---

## 🏗️ Arquitectura del Sistema

La aplicación sigue un modelo de arquitectura distribuida donde:
1. El **Frontend (Ionic)** se comunica con las APIs REST de Node.js y Spring Boot.
2. La capa de servicios utiliza **CORBA** para la comunicación entre componentes críticos del servidor, permitiendo que diferentes lenguajes y plataformas interactúen de forma transparente.

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

## 📦 Instalación y Configuración

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