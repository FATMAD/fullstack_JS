"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = userRoutes;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
function userRoutes(app) {
    return __awaiter(this, void 0, void 0, function* () {
        const userSchema = zod_1.z.object({
            firstName: zod_1.z.string().min(1),
            lastName: zod_1.z.string().min(1),
            email: zod_1.z.string().email(),
            password: zod_1.z.string().min(6),
            birthdate: zod_1.z.string().transform((val) => new Date(val)),
        }).strict();
        const updateUserSchema = zod_1.z.object({
            firstName: zod_1.z.string().min(1).optional(),
            lastName: zod_1.z.string().min(1).optional(),
            email: zod_1.z.string().email().optional(),
            password: zod_1.z.string().min(6).optional(),
            birthdate: zod_1.z.string().transform((val) => new Date(val)).optional(),
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
        }, (req, reply) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userData = userSchema.parse(req.body);
                const existingUser = yield prisma.user.findUnique({
                    where: { email: userData.email },
                });
                if (existingUser) {
                    return reply.status(400).send({ error: "Email is already in use" });
                }
                const hashedPassword = yield bcryptjs_1.default.hash(userData.password, 10);
                const user = yield prisma.user.create({
                    data: Object.assign(Object.assign({}, userData), { password: hashedPassword })
                });
                // Exclude password from the response
                const { password } = user, userWithoutPassword = __rest(user, ["password"]);
                reply.status(201).send(userWithoutPassword);
            }
            catch (error) {
                reply.status(400).send(error);
            }
        }));
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
        }, (req, reply) => __awaiter(this, void 0, void 0, function* () {
            const users = yield prisma.user.findMany({
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    birthdate: true,
                },
            });
            reply.send(users);
        }));
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
        }, (req, reply) => __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                const user = yield prisma.user.findUnique({
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
            }
            catch (error) {
                reply.status(500).send({ error: "Error fetching user" });
            }
        }));
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
        }, (req, reply) => __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                const updateData = updateUserSchema.parse(req.body);
                // Hash password if it's provided in the update request
                if (updateData.password) {
                    updateData.password = yield bcryptjs_1.default.hash(updateData.password, 10);
                }
                // Perform the update
                const updatedUser = yield prisma.user.update({
                    where: { id },
                    data: updateData,
                });
                // Exclude password from the response
                const { password } = updatedUser, userWithoutPassword = __rest(updatedUser, ["password"]);
                // Respond with the updated user data excluding the password
                reply.send(userWithoutPassword);
            }
            catch (error) {
                reply.status(400).send({ error: "Error updating user" });
            }
        }));
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
        }, (req, reply) => __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                // Validate if the user exists before deletion
                const user = yield prisma.user.delete({
                    where: { id },
                });
                // Respond with a message and the deleted user data
                reply.send({ message: "User deleted", user });
            }
            catch (error) {
                reply.status(500).send({ error: "Error deleting user" });
            }
        }));
    });
}
