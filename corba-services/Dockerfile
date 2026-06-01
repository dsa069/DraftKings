# Usamos JDK (no JRE) porque necesitamos el binario 'orbd'
FROM eclipse-temurin:8-jdk

WORKDIR /app

# RUTA ACTUALIZADA: Ahora Docker busca desde la carpeta común 'corba-services'
COPY DK_News_Manager/target/*-jar-with-dependencies.jar /app/corba-server.jar

# Creamos un script que lanza el ORB y luego el Servidor
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'echo "[SISTEMA] Iniciando Naming Service (ORBD) en puerto 3000..." ' >> /app/start.sh && \
    # Lanzamos orbd en segundo plano (&) y redirigimos su salida a la consola
    echo 'orbd -ORBInitialPort 3000 -ORBInitialHost localhost & ' >> /app/start.sh && \
    echo 'sleep 5' >> /app/start.sh && \
    echo 'echo "[SISTEMA] Iniciando Buffer Server en puerto 8090..." ' >> /app/start.sh && \
    # El servidor se conecta al ORB interno (localhost)
    echo 'exec java -cp /app/corba-server.jar Server.BufferServer -ORBInitialPort 3000 -ORBInitialHost localhost "$@"' >> /app/start.sh && \
    chmod +x /app/start.sh

# Exponemos ambos puertos: 3000 (Naming), 8090 (Servidor) y 8080 (futuro cliente web)
EXPOSE 3000 8080 8090

ENTRYPOINT ["/app/start.sh"]