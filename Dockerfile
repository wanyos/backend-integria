# Usa una imagen base de Node.js
FROM node:22-alpine

# Instala las dependencias necesarias para compilar módulos nativos
RUN apk add --no-cache python3 make g++ 

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copia los archivos necesarios al contenedor
COPY package*.json ./
COPY . .

# Instala las dependencias
RUN npm install --production

# Recompila los módulos nativos para Alpine
RUN npm rebuild bcrypt --build-from-source

# Expone el puerto definido en el archivo .env.production
EXPOSE 8022

# Establece las variables de entorno para producción
ENV NODE_ENV=production

# Comando para iniciar el servidor
CMD ["npm", "run", "serve:start"]