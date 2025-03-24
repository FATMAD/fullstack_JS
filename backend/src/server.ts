import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import fastifyJwt from "fastify-jwt";
import fastifySwagger from "@fastify/swagger";  
import fastifySwaggerUi from '@fastify/swagger-ui';
import { userRoutes } from "./routes/userRoutes";
import { authRoutes } from "./routes/authRoutes";
import * as dotenv from "dotenv";
import cors from '@fastify/cors';
import fastifyCookie from "@fastify/cookie";


// Load environment variables
dotenv.config();

// Initialize Fastify instance
const app: FastifyInstance = Fastify();

// Register CORS plugin with additional security considerations
app.register(cors, {
  origin: process.env.CORS_ORIGIN || "*", // Replace with a specific domain in production
  credentials: true, // Allow sending cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  allowedHeaders: [
    'Content-Type', // Type de contenu de la requête
    'Authorization', // Jeton ou informations d'authentification
    'Accept', // Type de contenu accepté
    'X-Requested-With', // Requêtes AJAX
    'Origin', // L'origine de la requête
  ],
  exposedHeaders: [
    'My-Custom-Header', // Exposer un en-tête personnalisé
    'Authorization', // Exposer un jeton JWT ou un autre jeton
    'Location', // Exposer les en-têtes de redirection si nécessaire
  ],
});

// Register JWT plugin for authentication
// Consider setting a more secure default for JWT_SECRET in production
app.register(fastifyJwt, { secret: process.env.JWT_SECRET || "Secret" });

// Register Swagger plugin for API documentation (this should be registered first)
app.register(fastifySwagger, {
  swagger: {
    info: {
      title: 'API Documentation',
      description: 'API for managing users and authentication',
      version: '1.0.0',
    },
  },
});

// Serve Swagger UI at the /documentation endpoint (this comes after fastifySwagger)
app.register(fastifySwaggerUi, {
  routePrefix: '/documentation',
  uiConfig: {
    docExpansion: 'none', // Optional: Set Swagger UI to collapse all sections by default
  },
});

// Authentication hook to protect routes
app.addHook("onRequest", async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    // Skip JWT verification for login and registration routes
    // Consider adding more excluded routes (e.g., public endpoints)
    if (req.url === "/login" || req.url === "/register" || req.url === "/documentation" || req.url === "/documentation/json") {
      return;
    }

    // Verify JWT token
    await req.jwtVerify();
  } catch (err) {
    reply.status(401).send({ error: "Unauthorized" });
  }
});

// Register routes for users and authentication
// Make sure routes are registered in the correct order, especially if they depend on JWT verification
app.register(userRoutes);
app.register(authRoutes);
app.register(fastifyCookie);


// Start the server
app.listen({ port: 3000 }, (err, address) => {
  if (err) {
    // Log the error with a more descriptive message
    console.error("Error starting server:", err);
    process.exit(1);
  }
  console.log(`Server running on ${address}`);
});
