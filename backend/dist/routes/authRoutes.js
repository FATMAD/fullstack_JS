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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = authRoutes;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
function authRoutes(app) {
    return __awaiter(this, void 0, void 0, function* () {
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
        }, (req, reply) => __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            const user = yield prisma.user.findUnique({ where: { email } });
            if (!user) {
                return reply.status(401).send({ error: "Invalid credentials" });
            }
            const isPasswordValid = yield bcryptjs_1.default.compare(password, user.password);
            if (!isPasswordValid) {
                return reply.status(401).send({ error: "Invalid credentials" });
            }
            const token = app.jwt.sign({ id: user.id, email: user.email });
            reply.send({ token });
        }));
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
        }, (req, reply) => __awaiter(this, void 0, void 0, function* () {
            const { firstName, lastName, email, password, birthdate } = req.body;
            if (!firstName || !lastName || !email || !password || !birthdate) {
                return reply.status(400).send({ error: "All fields are required" });
            }
            const existingUser = yield prisma.user.findUnique({
                where: { email },
            });
            if (existingUser) {
                return reply.status(400).send({ error: "Email is already in use" });
            }
            const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
            try {
                const user = yield prisma.user.create({
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
            }
            catch (error) {
                console.error(error);
                reply.status(500).send({ error: "Internal Server Error" });
            }
        }));
    });
}
