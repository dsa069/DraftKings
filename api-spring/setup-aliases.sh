#!/bin/bash

# Script para configurar alias de microservicios Spring Boot

echo "Configurando aliases para microservicios Spring Boot..."

# Agregar los alias al archivo ~/.bashrc
cat >> ~/.bashrc << 'EOF'

# Aliases para iniciar microservicios Spring Boot
alias run-eureka="cd /workspace/api-spring/eureka.server && ./mvnw spring-boot:run"
alias run-config="cd /workspace/api-spring/config.server && ./mvnw spring-boot:run"
alias run-gateway="cd /workspace/api-spring/gateway && ./mvnw spring-boot:run"
alias run-manager="cd /workspace/api-spring/eureka.client.manager && ./mvnw spring-boot:run"
alias run-player="cd /workspace/api-spring/eureka.client.player && ./mvnw spring-boot:run"
alias run-review="cd /workspace/api-spring/eureka.client.review && ./mvnw spring-boot:run"
EOF

# Recargar el archivo
source ~/.bashrc

echo "✓ Aliases configurados correctamente"
echo "Comandos disponibles:"
echo "  - run-eureka"
echo "  - run-config"
echo "  - run-gateway"
echo "  - run-manager"
echo "  - run-player"
echo "  - run-review"
