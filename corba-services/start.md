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