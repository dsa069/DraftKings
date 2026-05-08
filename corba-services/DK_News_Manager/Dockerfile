FROM eclipse-temurin:8-jre
# Expone el puerto típico de CORBA
EXPOSE 8080
# Copia los archivos compilados
COPY --from=build /app/target/classes/ /app/classes/
# Copia el JAR con dependencias para que esté disponible si se necesita
COPY --from=build /app/target/corba-buffer-server-1.0.0-jar-with-dependencies.jar /app/corba-server.jar
# Establece el directorio de trabajo
WORKDIR /app
# Script para ejecutar el servidor CORBA con argumentos ORB
RUN echo '#!/bin/sh' > /app/start-server.sh && \
    echo 'exec java -cp /app/classes:/app/corba-server.jar Server.BufferServer "$@"' >> /app/start-server.sh && \
    chmod +x /app/start-server.sh
# Ejecuta el servidor CORBA
ENTRYPOINT ["/app/start-server.sh"]