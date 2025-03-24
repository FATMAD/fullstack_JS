# Étape 1 : Utiliser l'image Node.js officielle
FROM node:20-slim AS build

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier le fichier package.json et package-lock.json (ou yarn.lock)
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier tout le code du projet dans le conteneur
COPY . .

# Construire le projet (si tu utilises TypeScript ou un build spécifique)
# RUN npm run build

# Exposer le port que l'application Fastify utilise (ex : 3000)
EXPOSE 3000

# Démarrer le serveur Fastify
CMD ["npm", "start"]
