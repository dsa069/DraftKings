# Cambiamos a JDK porque el JRE no incluye el binario 'orbd'
FROM eclipse-temurin:8-jdk

# Exponemos el puerto del Naming Service (3000) y del Servidor (8080)
EXPOSE 3000 8080

WORKDIR /app

COPY target/*-jar-with-dependencies.jar /app/corba-server.jar

# Script para ejecutar AMBOS: ORBD en segundo plano y luego el Servidor
RUN echo '#!/bin/sh' > /app/start-all.sh && \
    echo 'echo "Iniciando Naming Service (ORBD) en puerto 3000..." ' >> /app/start-all.sh && \
    echo 'orbd -ORBInitialPort 3000 -ORBInitialHost localhost & ' >> /app/start-all.sh && \
    echo 'sleep 3' >> /app/start-all.sh && \
    echo 'echo "Iniciando Servidor CORBA..." ' >> /app/start-all.sh && \
    echo 'exec java -Dcom.sun.corba.se.ORBServerPort=8080 -cp /app/corba-server.jar Server.BufferServer -ORBInitialPort 3000 -ORBInitialHost localhost "$@"' >> /app/start-all.sh && \
    chmod +x /app/start-all.sh

ENTRYPOINT ["/app/start-all.sh"]