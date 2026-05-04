//////CONTROL DE VERSIONES///////
Para realizar un mensaje de commit, utiliza siempre el siguiente formato:
```
<tipo>/<subrepo>: <descripción>
```
Donde:
- `<tipo>`: Es el tipo de cambio que estás realizando. Algunos ejemplos comunes son:
  - "feat/": para nuevas funcionalidades.
  - "fix/": para correcciones de errores.
  - "docs/": para cambios en la documentación.
  - "style/": para cambios que no afectan el significado del código (espacios en blanco, formato, etc.).
  - "refactor/": para cambios que no corrigen errores ni agregan funcionalidades, pero mejoran la estructura del código.
  - "test/": para agregar o corregir pruebas.
  - "chore/": para tareas de mantenimiento que no afectan el código fuente ni las pruebas.
  
- `<subrepo>`: Especifica el subrepositorio o módulo al que se refiere el cambio:
  - "ionic": para cambios relacionados con el cliente Ionic.
  - "spring": para cambios relacionados con el servidor Spring.
  - "node": para cambios relacionados con el servidor Node.
  - "corba": para cambios en el servidor Corba.
  - "shared": para cambios que afectan a ambos lados o a la lógica compartida.

- `<descripción>`: Es una breve descripción del cambio que estás realizando. Debe ser concisa pero informativa, indicando claramente qué se ha cambiado y por qué.

//////CLIENT_IONIC//////
- Framework: Angular 19+ (Standalone Components obligatorios).
- UI: Ionic 8+.
- Reactividad: Usar Angular Signals en lugar de variables
  simples siempre que sea posible.
- Arquitectura: Estructura de carpetas Core/Shared/Features.
- Estilo: Usar la función inject() para dependencias,
  evitar constructores.
- Sintaxis: Usar nuevo Control Flow (@if, @for).

//////API_NODE//////
- Framework: Express 4+.
- Estructura: Separar rutas, controladores y servicios en carpetas distintas.
- Middleware: Usar middleware para JWT.
- OJO: Se utiliza TypeScript, no JavaScript. Asegúrate de configurar el proyecto correctamente para usar TypeScript.
- Documentación: Usar Swagger para la documentación de la API.
- Pruebas: Escribir pruebas unitarias con Jest para asegurar la calidad del código.

//////API_SPRING//////
- Framework: Spring Boot 3+.
- JAVA 17.
- Gestión de dependencias: Usar Maven para la gestión de dependencias y construcción del proyecto.
- Estructura: Seguir la arquitectura tradicional de Spring (Controladores, Servicios, Repositorios).
- Servicios: Se utilizara Feign para los microservicios, Eureka para el descubrimiento de servicios, Gateway para la gestión de rutas y Config Server para la gestión de configuraciones.
- Pruebas: Escribir pruebas unitarias con JUnit 5 y Mockito para asegurar la calidad del código.
- Documentación: Usar Swagger para la documentación de la API.
- Configuración: Utilizar archivos de configuración YAML para gestionar las propiedades de la aplicación.
- Manejo de errores: Implementar un manejo de errores personalizado con RestHandler para proporcionar respuestas de error consistentes y claras.

//////CORBA_SERVER//////
- Lenguaje: Java.
- Java: 8.
- Estructura: Seguir la arquitectura tradicional de Java (Paquetes para interfaces, implementaciones, etc.).
- Comunicación: Usar IDL para definir las interfaces de comunicación entre el cliente y el servidor.
- Pruebas: Escribir pruebas unitarias con JUnit 5 y Mockito para asegurar la calidad del código.