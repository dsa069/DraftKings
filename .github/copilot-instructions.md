//////CONTROL DE VERSIONES///////
Para realizar un mensaje de commit, utiliza siempre el siguiente formato antes de la descripción del cambio:
- "feat/": para nuevas funcionalidades.
- "fix/": para correcciones de errores.
- "docs/": para cambios en la documentación.
- "style/": para cambios que no afectan el significado del código (espacios en blanco, formato, etc.).
- "refactor/": para cambios que no corrigen errores ni agregan funcionalidades, pero mejoran la estructura del código.
- "test/": para agregar o corregir pruebas.
- "chore/": para tareas de mantenimiento que no afectan el código fuente ni las pruebas.

//////CLIENT_IONIC//////
- Framework: Angular 19+ (Standalone Components obligatorios).
- UI: Ionic 8+.
- Reactividad: Usar Angular Signals en lugar de variables
  simples siempre que sea posible.
- Arquitectura: Estructura de carpetas Core/Shared/Features.
- Estilo: Usar la función inject() para dependencias,
  evitar constructores.
- Sintaxis: Usar nuevo Control Flow (@if, @for).