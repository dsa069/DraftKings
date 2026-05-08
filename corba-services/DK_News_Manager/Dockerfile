FROM eclipse-temurin:8-jre

# Expone el puerto típico de CORBA
EXPOSE 8080

# Establece el directorio de trabajo
WORKDIR /app

# Copia EL JAR local (descargado por GitHub Actions) directamente a la imagen
# Usamos el comodín por si el nombre incluye la versión
COPY target/*-jar-with-dependencies.jar /app/corba-server.jar

# Script para ejecutar el servidor CORBA con argumentos ORB
# Ya no necesitamos añadir /app/classes al classpath porque el Fat JAR tiene todo
RUN echo '#!/bin/sh' > /app/start-server.sh && \
    echo 'exec java -cp /app/corba-server.jar Server.BufferServer "$@"' >> /app/start-server.sh && \
    chmod +x /app/start-server.sh

# Ejecuta el servidor CORBA
ENTRYPOINT ["/app/start-server.sh"]