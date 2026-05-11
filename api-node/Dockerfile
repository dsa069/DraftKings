FROM node:24-alpine

ENV NODE_ENV=dev

# Crear directorio de la app
WORKDIR /app

# Copiar dependencias
COPY package*.json ./

# Instalación limpia de dependencias
RUN npm ci

# Copiar código fuente
COPY dist ./dist

EXPOSE 8080

CMD [ "node", "dist/index.js" ]