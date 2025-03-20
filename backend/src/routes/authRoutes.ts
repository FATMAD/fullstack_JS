import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function authRoutes(app: FastifyInstance) {
    // Login Route
    app.post("/login", {
        schema: {
            description: "User login",
            tags: ["auth"],
            body: {
                type: "object",
                required: ["email", "password"],
                properties: {
                    email: { type: "string", format: "email" },
                    password: { type: "string", minLength: 6 },
                },
            },
            response: {
                200: {
                    type: "object",
                    properties: {
                        token: { type: "string" },
                    },
                },
                401: {
                    type: "object",
                    properties: {
                        error: { type: "string" },
                    },
                },
            },
        },
    }, async (req, reply) => {
        const { email, password } = req.body as { email: string, password: string };

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return reply.status(401).send({ error: "Invalid credentials" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return reply.status(401).send({ error: "Invalid credentials" });
        }

        const token = app.jwt.sign({ id: user.id, email: user.email });

        reply.send({ token });
    });

    // Register Route
    app.post("/register", {
        schema: {
            description: "User registration",
            tags: ["auth"],
            body: {
                type: "object",
                required: ["firstName", "lastName", "email", "password", "birthdate"],
                properties: {
                    firstName: { type: "string", minLength: 1 },
                    lastName: { type: "string", minLength: 1 },
                    email: { type: "string", format: "email" },
                    password: { type: "string", minLength: 6 },
                    birthdate: { type: "string", format: "date" },
                },
            },
            response: {
                201: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        firstName: { type: "string" },
                        lastName: { type: "string" },
                        email: { type: "string" },
                        birthdate: { type: "string", format: "date" },
                    },
                },
                400: {
                    type: "object",
                    properties: {
                        error: { type: "string" },
                    },
                },
                500: {
                    type: "object",
                    properties: {
                        error: { type: "string" },
                    },
                },
            },
        },
    }, async (req, reply) => {
        const { firstName, lastName, email, password, birthdate } = req.body as { firstName: string, lastName: string, email: string, password: string, birthdate: string };

        if (!firstName || !lastName || !email || !password || !birthdate) {
            return reply.status(400).send({ error: "All fields are required" });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return reply.status(400).send({ error: "Email is already in use" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const user = await prisma.user.create({
                data: {
                    firstName,
                    lastName,
                    email,
                    password: hashedPassword,
                    birthdate: new Date(birthdate),
                },
            });

            reply.status(201).send({
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                birthdate: user.birthdate,
            });
        } catch (error) {
            console.error(error);
            reply.status(500).send({ error: "Internal Server Error" });
        }
    });
}
