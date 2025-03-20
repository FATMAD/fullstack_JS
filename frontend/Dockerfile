# Étape 1 : Construction de l'application Angular
FROM node:16 AS build

WORKDIR /app

# Installer les dépendances Angular
COPY ./frontend/package*.json ./
RUN npm install

# Copier le code source et construire l'application
COPY ./frontend ./
RUN npm run build --prod

# Étape 2 : Serveur web pour servir l'application Angular
FROM nginx:alpine

# Copier les fichiers construits par Angular
COPY --from=build /app/dist /usr/share/nginx/html

# Exposer le port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
