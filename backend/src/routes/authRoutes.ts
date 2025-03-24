import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";  // Import de Zod pour la validation des données
import { Logger } from "pino";  // Utilisation de Pino pour un logging performant

const prisma = new PrismaClient();
const logger: Logger = require("pino")();

// Définition du schéma de validation avec Zod pour la route de connexion
const loginSchema = z.object({
    email: z.string().email(),  // Validation du format de l'email
    password: z.string().min(6), // Validation que le mot de passe ait au moins 6 caractères
});

// Définition du schéma de validation avec Zod pour la route d'enregistrement
const registerSchema = z.object({
    firstName: z.string().min(1), // Le prénom doit être non vide
    lastName: z.string().min(1),  // Le nom de famille doit être non vide
    email: z.string().email(),  // L'email doit respecter le format de l'email
    password: z.string().min(6), // Le mot de passe doit avoir au moins 6 caractères
    birthdate: z.string().refine(val => !isNaN(Date.parse(val)), {
        message: "Invalid date format",  // Vérifie si la date est valide
    }),
});

export async function authRoutes(app: FastifyInstance) {

    // Route de connexion
    app.post("/login", {
        schema: {
            description: "User login",  // Description de la route pour la documentation
            tags: ["auth"],  // Tag pour classer cette route dans la documentation
            body: {
                type: "object",  // Définition du corps de la requête comme un objet
                properties: {
                    email: { type: "string" },
                    password: { type: "string" },
                },
                required: ["email", "password"],  // Champs requis pour cette route (validé dans Fastify)
            },
            response: {
                200: { type: "object", properties: { token: { type: "string" } } },  // Réponse attendue en cas de succès
                401: { type: "object", properties: { error: { type: "string" } } },  // Réponse en cas d'erreur d'authentification
            },
        },
    }, async (req: FastifyRequest<{ Body: { email: string, password: string } }>, reply: FastifyReply) => {
        try {
            // Validation des données de la requête avec Zod
            const { email, password } = loginSchema.parse(req.body);

            // Recherche de l'utilisateur dans la base de données
            const user = await prisma.user.findUnique({ where: { email } });
            if (!user) {
                logger.warn(`Login attempt failed: user not found with email ${email}`);
                return reply.status(401).send({ error: "Invalid email or password" });
            }

            // Vérification du mot de passe
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                logger.warn(`Login attempt failed: invalid password for user ${email}`);
                return reply.status(401).send({ error: "Invalid email or password" });
            }

            // Génération d'un token JWT
            const token = app.jwt.sign({ id: user.id, email: user.email }, { expiresIn: '1h' });

            logger.info(`User ${email} logged in successfully`);
            reply.send({ token });
        } catch (error) {
            logger.error(error, 'Error during login process');
            if (error instanceof z.ZodError) {
                return reply.status(400).send({ error: "Invalid data format" });
            }
            return reply.status(500).send({ error: "Internal Server Error" });
        }
    });

    // Route d'enregistrement
    app.post("/register", {
        schema: {
            description: "User registration",  // Description de la route pour la documentation
            tags: ["auth"],  // Tag pour classer cette route dans la documentation
            body: {
                type: "object",  // Définition du corps de la requête comme un objet
                properties: {
                    firstName: { type: "string" },
                    lastName: { type: "string" },
                    email: { type: "string" },
                    password: { type: "string" },
                    birthdate: { type: "string", format: "date" },
                },
                required: ["firstName", "lastName", "email", "password", "birthdate"],  // Champs requis pour cette route (validé dans Fastify)
            },
            response: {
                201: { type: "object", properties: { id: { type: "string" }, firstName: { type: "string" }, lastName: { type: "string" }, email: { type: "string" }, birthdate: { type: "string", format: "date" } } },
                400: { type: "object", properties: { error: { type: "string" } } },
                500: { type: "object", properties: { error: { type: "string" } } },
            },
        },
    }, async (req: FastifyRequest<{ Body: { firstName: string, lastName: string, email: string, password: string, birthdate: string } }>, reply: FastifyReply) => {
        try {
            // Validation des données de la requête avec Zod
            const { firstName, lastName, email, password, birthdate } = registerSchema.parse(req.body);

            // Vérification si l'utilisateur existe déjà dans la base de données
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser) {
                logger.warn(`Registration failed: email already in use (${email})`);
                return reply.status(400).send({ error: "Email is already in use" });
            }

            // Hashage du mot de passe avant de l'enregistrer
            const hashedPassword = await bcrypt.hash(password, 10);

            // Création de l'utilisateur dans la base de données
            const user = await prisma.user.create({
                data: {
                    firstName,
                    lastName,
                    email,
                    password: hashedPassword,
                    birthdate: new Date(birthdate),
                },
            });

            logger.info(`User ${email} registered successfully`);
            reply.status(201).send({
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                birthdate: user.birthdate.toISOString(),
            });
        } catch (error) {
            logger.error(error, 'Error during registration process');
            if (error instanceof z.ZodError) {
                return reply.status(400).send({ error: "Invalid data format" });
            }
            return reply.status(500).send({ error: "Internal Server Error" });
        }
    });

    // Route de déconnexion (Logout)
    app.post("/logout", async (_req: FastifyRequest, reply: FastifyReply) => {
        try {
            reply.clearCookie("token");  // Suppression du cookie contenant le token JWT
            logger.info('User logged out successfully');
            reply.send({ message: "Successfully logged out" });
        } catch (error) {
            logger.error(error, 'Error during logout process');
            return reply.status(500).send({ error: "Internal Server Error" });
        }
    });
}
