# Endpoints y resultados — DK_News_Prod_Cons

Servidor: http://localhost:8070/DK_News_Prod_Cons/servlet

## 1) HTML UI (GET)

Comando:

```bash
curl -i http://localhost:8070/DK_News_Prod_Cons/servlet
```

Respuesta (recortada - HTML completo en el log):

```
HTTP/1.1 200 
Content-Type: text/html;charset=UTF-8
Content-Length: 4294
Date: Sun, 31 May 2026 15:44:59 GMT

<html>... (formulario HTML) ...</html>
```

La respuesta contiene el formulario UI con campos: `fecha`, `jugador`, `interes`, `titulo`, `descripcion`, `etiquetas`, `indice` y botones `Enviar`, `Obtener todas`, `Leer en`.

## 2) Obtener todas (JSON) — buffer vacío

Comando:

```bash
curl -G -i --data-urlencode "action=Obtener todas" --data-urlencode "format=json" http://localhost:8070/DK_News_Prod_Cons/servlet
```

Respuesta:

```
HTTP/1.1 200 
Content-Type: application/json;charset=UTF-8
Content-Length: 45
Date: Sun, 31 May 2026 15:45:01 GMT

{"ok":false,"error":"El buffer esta vacio."}
```

## 3) Enviar (POST JSON) — validación de descripción (demasiado corta)

Comando:

```bash
curl -i -X POST -H "Accept: application/json" -d "action=Enviar" -d "fecha=31/05/2026" -d "jugador=Juan Perez" -d "interes=alta" -d "titulo=Prueba" -d "descripcion=desc" -d "etiquetas=#prueba" http://localhost:8070/DK_News_Prod_Cons/servlet
```

Respuesta:

```
HTTP/1.1 200 
Content-Type: application/json;charset=UTF-8
Content-Length: 76
Date: Sun, 31 May 2026 15:45:16 GMT

{"ok":false,"error":"La descripcion debe tener entre 20 y 250 caracteres."}
```

## 4) Enviar (POST JSON) — noticia insertada correctamente

Comando (descripción larga válida):

```bash
curl -i -X POST -H "Accept: application/json" -d "action=Enviar" -d "fecha=31/05/2026" -d "jugador=Juan Perez" -d "interes=alta" -d "titulo=Prueba" -d "descripcion=descaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" -d "etiquetas=#prueba" http://localhost:8070/DK_News_Prod_Cons/servlet
```

Respuesta:

```
HTTP/1.1 200 
Content-Type: application/json;charset=UTF-8
Content-Length: 75
Date: Sun, 31 May 2026 15:45:37 GMT

{"ok":true,"action":"Enviar","message":"Noticia insertada correctamente."}
```

## 5) Leer en (POST JSON) — índice 0

Comando:

```bash
curl -i -X POST -H "Accept: application/json" -d "action=Leer en" -d "indice=0" http://localhost:8070/DK_News_Prod_Cons/servlet
```

Respuesta:

```
HTTP/1.1 200 
Content-Type: application/json;charset=UTF-8
Content-Length: 294
Date: Sun, 31 May 2026 15:45:45 GMT

{"ok":true,"action":"Leer en","indice":0,"noticia":{"indice":0,"fecha":"31/05/2026","jugador":"Juan Perez","interes":"alta","titulo":"Prueba","descripcion":"descaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","etiquetas":["#prueba"]}}
```

## 6) Obtener todas (JSON) — ahora con 1 noticia

Comando:

```bash
curl -G -i --data-urlencode "action=Obtener todas" --data-urlencode "format=json" http://localhost:8070/DK_News_Prod_Cons/servlet
```

Respuesta:

```
HTTP/1.1 200 
Content-Type: application/json;charset=UTF-8
Content-Length: 302
Date: Sun, 31 May 2026 15:45:59 GMT

{"ok":true,"action":"Obtener todas","count":1,"noticias":[{"indice":0,"fecha":"31/05/2026","jugador":"Juan Perez","interes":"alta","titulo":"Prueba","descripcion":"descaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","etiquetas":["#prueba"]}]}
```

---

Notas rápidas:
- Los endpoints devuelven `application/json` cuando se solicita (`format=json` o `Accept: application/json`).
- La validación de campos aplica (ej. `descripcion` entre 20 y 250 caracteres; `jugador` entre 2 y 50 caracteres).
- Si quieres que genere ejemplos curl adicionales (por ejemplo, con JSON en body multipart o con encabezados), o un README con pasos de despliegue, lo hago ahora.
