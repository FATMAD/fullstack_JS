import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function userRoutes(app: FastifyInstance) {
    const userSchema = z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(6),
        birthdate: z.string().transform((val) => new Date(val)),
    }).strict();

    const updateUserSchema = z.object({
        firstName: z.string().min(1).optional(),
        lastName: z.string().min(1).optional(),
        email: z.string().email().optional(),
        password: z.string().min(6).optional(),
        birthdate: z.string().transform((val) => new Date(val)).optional(),
    }).strict();

    // Create a new user
    app.post("/users", {
        schema: {
            description: 'Create a new user',
            tags: ['users'],
            body: {
                type: 'object',
                required: ['firstName', 'lastName', 'email', 'password', 'birthdate'], // Define required fields explicitly
                properties: {
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    email: { type: 'string' },
                    password: { type: 'string' },
                    birthdate: { type: 'string' },
                },
            },
            response: {
                201: {
                    type: 'object',
                    required: ['id', 'firstName', 'lastName', 'email', 'birthdate'], // Add required fields in response schema
                    properties: {
                        id: { type: 'string' },
                        firstName: { type: 'string' },
                        lastName: { type: 'string' },
                        email: { type: 'string' },
                        birthdate: { type: 'string' },
                    },
                },
            },
        },
    }, async (req, reply) => {
        try {
            const userData = userSchema.parse(req.body);

            const existingUser = await prisma.user.findUnique({
                where: { email: userData.email },
            });

            if (existingUser) {
                return reply.status(400).send({ error: "Email is already in use" });
            }

            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const user = await prisma.user.create({
                data: { ...userData, password: hashedPassword }
            });

            // Exclude password from the response
            const { password, ...userWithoutPassword } = user;

            reply.status(201).send(userWithoutPassword);
        } catch (error) {
            reply.status(400).send(error);
        }
    });

    // Get all users
    app.get("/users", {
        schema: {
            description: 'Get all users',
            tags: ['users'],
            response: {
                200: {
                    type: 'array',
                    items: {
                        type: 'object',
                        required: ['id', 'firstName', 'lastName', 'email', 'birthdate'], // Add required fields in the items schema
                        properties: {
                            id: { type: 'string' },
                            firstName: { type: 'string' },
                            lastName: { type: 'string' },
                            email: { type: 'string' },
                            birthdate: { type: 'string' },
                        },
                    },
                },
            },
        },
    }, async (req, reply) => {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                birthdate: true,
            },
        });
        reply.send(users);
    });

    // Get user by ID
    app.get("/users/:id", {
        schema: {
            description: 'Get user by ID',
            tags: ['users'],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                },
                required: ['id'],
            },
            response: {
                200: {
                    type: 'object',
                    required: ['id', 'firstName', 'lastName', 'email', 'birthdate'], // Add required fields in response schema
                    properties: {
                        id: { type: 'string' },
                        firstName: { type: 'string' },
                        lastName: { type: 'string' },
                        email: { type: 'string' },
                        birthdate: { type: 'string' },
                    },
                },
                404: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' },
                    },
                },
            },
        },
    }, async (req, reply) => {
        const { id } = req.params as { id: string };

        try {
            const user = await prisma.user.findUnique({
                where: { id },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    birthdate: true,
                },
            });

            if (!user) {
                return reply.status(404).send({ error: "User not found" });
            }

            reply.send(user);
        } catch (error) {
            reply.status(500).send({ error: "Error fetching user" });
        }
    });

    // Update user by ID
    app.put("/users/:id", {
        schema: {
            description: 'Update user by ID',
            tags: ['users'],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                },
                required: ['id'],
            },
            body: {
                type: 'object',
                required: [], // Optional fields, no mandatory fields in body
                properties: {
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    email: { type: 'string' },
                    password: { type: 'string' },
                    birthdate: { type: 'string' },
                },
            },
            response: {
                200: {
                    type: 'object',
                    required: ['id', 'firstName', 'lastName', 'email', 'birthdate'], // Add required fields in response schema
                    properties: {
                        id: { type: 'string' },
                        firstName: { type: 'string' },
                        lastName: { type: 'string' },
                        email: { type: 'string' },
                        birthdate: { type: 'string' },
                    },
                },
                400: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' },
                    },
                },
            },
        },
    }, async (req, reply) => {
        const { id } = req.params as { id: string };

        try {
            const updateData = updateUserSchema.parse(req.body);

            // Hash password if it's provided in the update request
            if (updateData.password) {
                updateData.password = await bcrypt.hash(updateData.password, 10);
            }

            // Perform the update
            const updatedUser = await prisma.user.update({
                where: { id },
                data: updateData,
            });

            // Exclude password from the response
            const { password, ...userWithoutPassword } = updatedUser;

            // Respond with the updated user data excluding the password
            reply.send(userWithoutPassword);
        } catch (error) {
            reply.status(400).send({ error: "Error updating user" });
        }
    });

    // Delete user by ID
    app.delete("/users/:id", {
        schema: {
            description: 'Delete user by ID',
            tags: ['users'],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                },
                required: ['id'],
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                        user: {
                            type: 'object',
                            required: ['id', 'firstName', 'lastName', 'email', 'birthdate'], // Add required fields
                            properties: {
                                id: { type: 'string' },
                                firstName: { type: 'string' },
                                lastName: { type: 'string' },
                                email: { type: 'string' },
                                birthdate: { type: 'string' },
                            },
                        },
                    },
                },
                500: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' },
                    },
                },
            },
        },
    }, async (req, reply) => {
        const { id } = req.params as { id: string };

        try {
            // Validate if the user exists before deletion
            const user = await prisma.user.delete({
                where: { id },
            });

            // Respond with a message and the deleted user data
            reply.send({ message: "User deleted", user });
        } catch (error) {
            reply.status(500).send({ error: "Error deleting user" });
        }
    });
}
