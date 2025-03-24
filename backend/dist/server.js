"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const fastify_jwt_1 = __importDefault(require("fastify-jwt"));
const swagger_1 = __importDefault(require("@fastify/swagger"));
const swagger_ui_1 = __importDefault(require("@fastify/swagger-ui"));
const userRoutes_1 = require("./routes/userRoutes");
const authRoutes_1 = require("./routes/authRoutes");
const dotenv = __importStar(require("dotenv"));
const cors_1 = __importDefault(require("@fastify/cors"));
const cookie_1 = __importDefault(require("@fastify/cookie"));
// Load environment variables
dotenv.config();
// Initialize Fastify instance
const app = (0, fastify_1.default)();
// Register CORS plugin with additional security considerations
app.register(cors_1.default, {
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
app.register(fastify_jwt_1.default, { secret: process.env.JWT_SECRET || "Secret" });
// Register Swagger plugin for API documentation (this should be registered first)
app.register(swagger_1.default, {
    swagger: {
        info: {
            title: 'API Documentation',
            description: 'API for managing users and authentication',
            version: '1.0.0',
        },
    },
});
// Serve Swagger UI at the /documentation endpoint (this comes after fastifySwagger)
app.register(swagger_ui_1.default, {
    routePrefix: '/documentation',
    uiConfig: {
        docExpansion: 'none', // Optional: Set Swagger UI to collapse all sections by default
    },
});
// Authentication hook to protect routes
app.addHook("onRequest", (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Skip JWT verification for login and registration routes
        // Consider adding more excluded routes (e.g., public endpoints)
        if (req.url === "/login" || req.url === "/register" || req.url === "/documentation" || req.url === "/documentation/json") {
            return;
        }
        // Verify JWT token
        yield req.jwtVerify();
    }
    catch (err) {
        reply.status(401).send({ error: "Unauthorized" });
    }
}));
// Register routes for users and authentication
// Make sure routes are registered in the correct order, especially if they depend on JWT verification
app.register(userRoutes_1.userRoutes);
app.register(authRoutes_1.authRoutes);
app.register(cookie_1.default);
// Start the server
app.listen({ port: 3000 }, (err, address) => {
    if (err) {
        // Log the error with a more descriptive message
        console.error("Error starting server:", err);
        process.exit(1);
    }
    console.log(`Server running on ${address}`);
});
