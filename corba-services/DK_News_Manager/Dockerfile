# Usamos JDK (no JRE) porque necesitamos el binario 'orbd'
FROM eclipse-temurin:8-jdk

WORKDIR /app

# Copiamos el JAR
COPY target/*-jar-with-dependencies.jar /app/corba-server.jar

# Creamos un script que lanza el ORB y luego el Servidor
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'echo "[SISTEMA] Iniciando Naming Service (ORBD) en puerto 3000..." ' >> /app/start.sh && \
    # Lanzamos orbd en segundo plano (&) y redirigimos su salida a la consola
    echo 'orbd -ORBInitialPort 3000 -ORBInitialHost localhost & ' >> /app/start.sh && \
    echo 'sleep 5' >> /app/start.sh && \
    echo 'echo "[SISTEMA] Iniciando Buffer Server en puerto 8080..." ' >> /app/start.sh && \
    # El servidor se conecta al ORB interno (localhost)
    echo 'exec java -cp /app/corba-server.jar Server.BufferServer -ORBInitialPort 3000 -ORBInitialHost localhost "$@"' >> /app/start.sh && \
    chmod +x /app/start.sh

# Exponemos ambos puertos: 3000 (Naming) y 8080 (Servidor)
EXPOSE 3000 8080

# Comprueba cada 30 segundos si ambos puertos responden. Si uno falla, marca el contenedor como "unhealthy"
HEALTHCHECK --interval=100s --timeout=5s --start-period=15s --retries=3 \
  CMD bash -c '</dev/tcp/localhost/3000 && </dev/tcp/localhost/8080' || exit 1

ENTRYPOINT ["/app/start.sh"]