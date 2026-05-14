#!/bin/bash

# Script para configurar alias de microservicios Spring Boot
echo "Configurando aliases para microservicios Spring Boot (Dev y Prod)..."

# Agregar los alias al archivo ~/.bashrc
cat >> ~/.bashrc << 'EOF'

# --- Aliases Desarrollo (Default) ---
alias run-eureka="cd /workspace/api-spring/eureka.server && ./mvnw spring-boot:run"
alias run-config="cd /workspace/api-spring/config.server && ./mvnw spring-boot:run"
alias run-gateway="cd /workspace/api-spring/gateway && ./mvnw spring-boot:run"
alias run-player="cd /workspace/api-spring/eureka.client.player && ./mvnw spring-boot:run"
alias run-review="cd /workspace/api-spring/eureka.client.review && ./mvnw spring-boot:run"

# --- Aliases Producción (-PROD) ---
alias run-eureka-prod="cd /workspace/api-spring/eureka.server && ./mvnw spring-boot:run -Dspring-boot.run.profiles=prod"
alias run-config-prod="cd /workspace/api-spring/config.server && ./mvnw spring-boot:run -Dspring-boot.run.profiles=prod"
alias run-gateway-prod="cd /workspace/api-spring/gateway && ./mvnw spring-boot:run -Dspring-boot.run.profiles=prod"
alias run-player-prod="cd /workspace/api-spring/eureka.client.player && ./mvnw spring-boot:run -Dspring-boot.run.profiles=prod"
alias run-review-prod="cd /workspace/api-spring/eureka.client.review && ./mvnw spring-boot:run -Dspring-boot.run.profiles=prod"

# --- Master Shortcuts (Ejecutar todo a la vez) ---
# Nota: Se usa '&' para que corran en segundo plano en la misma terminal
alias run-all="run-eureka & sleep 10 && run-config & sleep 10 && run-gateway & run-player & run-review"
alias run-all-prod="run-eureka-prod & sleep 10 && run-config-prod & sleep 10 && run-gateway-prod & run-player-prod & run-review-prod"

EOF

# Recargar el archivo
source ~/.bashrc

echo "✓ Aliases configurados correctamente"
echo "Comandos disponibles:"
echo "  - run-eureka"
echo "  - run-config"
echo "  - run-gateway"
echo "  - run-player"
echo "  - run-review"
echo "  - run-eureka-prod"
echo "  - run-config-prod"
echo "  - run-gateway-prod"
echo "  - run-player-prod"
echo "  - run-review-prod"
echo "  - run-all (Ejecuta todo en modo Dev)"
echo "  - run-all-prod (Ejecuta todo en modo Prod)"
