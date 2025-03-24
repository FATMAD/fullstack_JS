# Fullstack JS Test - Utilisateurs API & Backoffice

## 🚀 Présentation
Ce projet est une application complète en **TypeScript** conteneurisée avec **Docker Compose**. Elle se compose de :

1. **Un backend Fastify** pour gérer une liste d'utilisateurs via une API REST sécurisée avec JWT.
2. **Un front-end en Angular** pour administrer les utilisateurs (CRUD, tri, filtres, etc.).
3. **Un Swagger** intégré pour tester les endpoints.

---

## 🛠️ Technologies utilisées

### Backend :
- **Fastify** - Serveur web rapide et minimaliste
- **JWT** - Authentification
- **Zod** - Validation des entrées
- **Prisma** - ORM pour la gestion de la base de données
- **MysqlSQL** - Base de données
- **Swagger (Fastify-Swagger)** - Documentation API

### Frontend :
- **Angular 19 ** (au choix)
- **RXJS / Fetch API** - Communication avec l'API
- **Material UI** (au choix) - UI
- **Angular Forms** - Validation des formulaires

### Outils DevOps :
- **Docker Compose** - Conteneurisation
- **ESLint, Prettier** - Qualité du code

---

## ⚙️ Installation et exécution

### Prérequis :
- **Docker & Docker Compose**
- **Node.js (18+)**
- **pnpm / npm / yarn**

### 🚀 Démarrer le projet

## Démarrer le Projet local

### 1. Backend (Fastify + MySQL)
1. Clonez le projet et accédez au dossier backend :
   
   git clone https://github.com/FATMAD/fullstack_JS/tree/master/backend
   cd backend

2. Installez les dépendances :
 ```
   npm install
 ```
3. Démarrez le serveur de développement fastifay:
 ```
   npx tsx
   node dist/server.js
```

4. L'application frontend sera disponible à l'adresse suivante :

http://localhost:3000  


 ### . Frontend (Angular)

1. Clonez le projet et accédez au dossier Frontend:
   ``` 
   git clone https://github.com/FATMAD/fullstack_JS/tree/master/frontend
    ```
Accédez au dossier frontend :

   cd frontend
2. Installez les dépendances :
 ```
   npm install
 ```
3. Démarrez le serveur de développement Angular :
 ```
   ng serve
 ```

4. L'application frontend sera disponible à l'adresse suivante :

http://localhost:4200  

mail et pasword pour tester le frontend 

"email": "teste@example.com",
"password": "password123",

 ## 🎨 Frontend - Fonctionnalités
✅ Connexion / Déconnexion
✅ Liste des utilisateurs avec tri & filtres
✅ Ajout / Modification / Suppression d'utilisateurs
✅ Validation des formulaires


 **Démarrer les services avec Docker :**
   ```
   docker-compose up --build
   ```



## Endpoints de l'API Backend

 - **Swagger API Docs** : `localhost:3000/documentation/json`


 
## 🔥 API REST - Endpoints

| Méthode  | Endpoint          | Description |
|----------|------------------ |-------------|
| **POST** | `/login`          | Connexion (JWT) |
| **POST** | `/register`       | Inscription |
| **POST** | `/logout`         | deconnexion|
| **GET**  | `/users`          | Récupérer tous les utilisateurs |
| **GET**  | `/users/:id`      | Détails d'un utilisateur |
| **PUT**  | `/users/:id`      | Modifier un utilisateur |
| **DELETE** | `/users/:id`    | Supprimer un utilisateur |

**📌 Tous les endpoints nécessitent un Token JWT sauf `/register` et `/login`.**

Authentification
POST /login

Description : Authentifie un utilisateur et retourne un token JWT.

Paramètres :

email : (string) L'email de l'utilisateur

password : (string) Le mot de passe de l'utilisateur

Réponse :

token : (string) Token JWT pour authentification

Utilisateurs
GET /users

Description : Récupère la liste de tous les utilisateurs.

Authentification : Requiert un token JWT valide dans l'en-tête Authorization.

Réponse :

Liste des utilisateurs avec les champs suivants :

id : (string) L'ID de l'utilisateur

firstName : (string) Le prénom de l'utilisateur

lastName : (string) Le nom de l'utilisateur

email : (string) L'email de l'utilisateur

birthdate : (DateTime) La date de naissance de l'utilisateur

POST /users

Description : Crée un nouvel utilisateur.

Authentification : Requiert un token JWT valide dans l'en-tête Authorization.

Paramètres :

firstName : (string) Le prénom

lastName : (string) Le nom

email : (string) L'email

password : (string) Le mot de passe

birthdate : (DateTime) La date de naissance

Réponse :

Détails de l'utilisateur créé (ID, prénom, nom, email, date de naissance).

PUT /users/:id

Description : Met à jour un utilisateur existant.

Authentification : Requiert un token JWT valide dans l'en-tête Authorization.

Paramètres :

id : (string) L'ID de l'utilisateur à mettre à jour

firstName : (string) Le prénom

lastName : (string) Le nom

email : (string) L'email

password : (string) Le mot de passe

birthdate : (DateTime) La date de naissance

Réponse :

Détails de l'utilisateur mis à jour (ID, prénom, nom, email, date de naissance).

DELETE /users/:id

Description : Supprime un utilisateur existant.

Authentification : Requiert un token JWT valide dans l'en-tête Authorization.

Paramètres :

id : (string) L'ID de l'utilisateur à supprimer

Réponse :

Message de confirmation de la suppression de l'utilisateur


---

## 📂 Structure du projet

```
📦 mon-projet
 ┣ 📂 backend
 ┃ ┣ 📂 src
 ┃ ┃ ┣ 📂 routes (Endpoints API)
 ┃ ┃ ┣ 📂 services
 ┃ ┃ ┣ 📂 models (Schemas Prisma)
 ┃ ┃ ┗ index.ts (Point d'entrée Fastify)
 ┃ ┗ dockerfile
 ┣ 📂 frontend
 ┃ ┣ 📂 src
 ┃ ┃ ┣ 📂 components
 ┃ ┃ ┣ 📂 pages
 ┃ ┃ ┗ App.tsx / App.vue / app.component.ts
 ┃ ┗ package.json
 ┣ docker-compose.yml
 ┣ README.md
```

---

