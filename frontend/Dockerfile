# Étape 1 : Utiliser l'image Node.js officielle pour construire l'application
FROM node:20-slim AS build

# Définir le répertoire de travail
WORKDIR /app

# Copier package.json et package-lock.json (ou yarn.lock)
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier tout le code source du projet Angular
COPY . .

# Construire l'application Angular
RUN npm run build --prod

# Étape 2 : Utiliser Nginx pour servir l'application Angular
FROM nginx:alpine

# Copier les fichiers buildés dans le répertoire public de Nginx
COPY --from=build /app/dist/ /usr/share/nginx/html

# Exposer le port 80 (port par défaut de Nginx)
EXPOSE 80

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]
