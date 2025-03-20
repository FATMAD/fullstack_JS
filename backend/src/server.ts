import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import fastifyJwt from "fastify-jwt";
import fastifySwagger from "@fastify/swagger";  
import fastifySwaggerUi from '@fastify/swagger-ui';
import { userRoutes } from "./routes/userRoutes";
import { authRoutes } from "./routes/authRoutes";
import * as dotenv from "dotenv";
import cors from '@fastify/cors';



// Load environment variables
dotenv.config();

// Initialize Fastify instance
const app: FastifyInstance = Fastify();

app.register(cors, {
    origin: true, // Allows requests from any origin (use a specific domain in production)
    credentials: true, // Allow sending cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  });

// Register JWT plugin for authentication
app.register(fastifyJwt, { secret: process.env.JWT_SECRET || "Secret" });

// Register Swagger plugin for API documentation (this should be registered first)
app.register(fastifySwagger);

// Serve Swagger UI at the /documentation endpoint (this comes after fastifySwagger)
app.register(fastifySwaggerUi, {
    routePrefix: '/documentation'
});

// Authentication hook to protect routes
app.addHook("onRequest", async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        // Skip JWT verification for login and registration routes
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
app.register(userRoutes);
app.register(authRoutes);

// Start the server
app.listen({ port: 3000 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server running on ${address}`);
});
