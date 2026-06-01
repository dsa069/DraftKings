# Despliegue de CORBA

## 1. Iniciar el ORB Daemon (ORBD)

### Windows

```bash
"/c/Program Files (x86)/Java/jdk-1.8/bin/orbd" -ORBInitialPort 1050 -ORBInitialHost localhost
```

### Linux

```bash
/opt/java/openjdk/bin/orbd -ORBInitialPort 1050 -ORBInitialHost localhost
```

> Mantén este proceso en ejecución durante toda la vida del servicio CORBA.

---

## 2. Compilar el servicio CORBA

```bash
cd /workspaces/DraftKings/corba-services/DK_News_Manager

mvn clean package
```

---

## 3. Iniciar el servidor CORBA

```bash
java -jar target/corba-buffer-server-1.0.0-jar-with-dependencies.jar \
  -ORBInitialPort 1050 \
  -ORBInitialHost localhost
```

> Si el servidor arranca correctamente, quedará registrado en el ORBD y listo para recibir peticiones de los consumidores y productores.
# Despliegue de DK_News_Prod_Cons

> Ejecuta todos los pasos desde `/workspaces/DraftKings/corba-services`.

## 1. Crear el WAR

```bash
cd DK_News_Prod_Cons

rm -rf /tmp/news_temp

mkdir -p /tmp/news_temp

cp -r WebContent/* /tmp/news_temp/

mkdir -p /tmp/news_temp/WEB-INF/classes

cp -r build/classes/* /tmp/news_temp/WEB-INF/classes/

jar -cvf DK_News_Prod_Cons.war -C /tmp/news_temp .
```

## 2. Copiar el WAR al Tomcat del repositorio

```bash
cp DK_News_Prod_Cons.war ../apache-tomcat-9.0.115/webapps/
```

O, desde la raíz del workspace:

```bash
cp DK_News_Prod_Cons/DK_News_Prod_Cons.war apache-tomcat-9.0.115/webapps/
```

## 3. Reiniciar el Tomcat incluido (sin sudo)

```bash
cd /workspaces/DraftKings/corba-services

apache-tomcat-9.0.115/bin/shutdown.sh || true
apache-tomcat-9.0.115/bin/startup.sh
```

## 4. Verificar que responde (HTTP en puerto 8070)

```bash
curl -I http://localhost:8070/DK_News_Prod_Cons/
```

Deberías ver una respuesta similar a:

```text
HTTP/1.1 200
```

## 5. Ver logs si falla

```bash
tail -n 200 apache-tomcat-9.0.115/logs/catalina.out
```

# Ejecutar un WAR externo (ej. trojan.war)

## 1. Copiar el WAR a Tomcat

Copia el archivo `.war` a la carpeta `webapps` del Tomcat incluido en el proyecto:

```bash
cp trojan.war apache-tomcat-9.0.115/webapps/
```

## 2. Iniciar Tomcat

Asegúrate de darle permisos a los scripts de Tomcat si es necesario (`chmod +x apache-tomcat-9.0.115/bin/*.sh`).
Si Tomcat no está iniciado, ejecútalo para que autodespliegue el archivo WAR:

```bash
apache-tomcat-9.0.115/bin/startup.sh
```

*(Si Tomcat ya estaba iniciado, debería detectarlo y desplegarlo automáticamente. En caso de fallos, puedes reiniciarlo combinando con `shutdown.sh`).*

## 3. Verificar el despliegue

Puedes acceder a la aplicación mediante HTTP en el puerto **8070**. La ruta principal (`/trojan`) será el nombre de tu archivo WAR sin la extensión `.war`:

```bash
curl -I http://localhost:8070/trojan/
```

# Ejecutar Tests de DK_News_Prod_Cons

Para compilar y ejecutar los test unitarios de forma local sin requerir de Eclipse o Maven, dispones del script `./run_tests.sh`.

## Ejecución desde la raíz del proyecto

```bash
cd DK_News_Prod_Cons
./run_tests.sh
```

El script se encargará automáticamente de:
1. Descargarse las dependencias JUnit 4 y Hamcrest.
2. Compilar los tests y el código.
3. Lanzar la batería de tests `InteresTest`, `NoticiaTest`, `NoticiaValidatorTest`, `ValidatorTest` y `XMLibTest`.