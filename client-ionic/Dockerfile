FROM node:24-alpine

# Crear directorio de la app
WORKDIR /usr/src/app

# Copiar dependencias
COPY package*.json ./

RUN npm install
# Para producción, puedes usar:
# RUN npm ci --only=production

# Copiar el resto del código
COPY . .

EXPOSE 8100

CMD [ "ionic", "serve" ]