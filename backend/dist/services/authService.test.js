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
const authService_1 = require("./authService");
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
// Mock de Prisma
jest.mock("@prisma/client", () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
        },
    },
}));
// Mock de bcryptjs
jest.mock("bcryptjs", () => ({
    hash: jest.fn().mockResolvedValue("hashedPassword"),
    compare: jest.fn(),
}));
describe("Auth Service", () => {
    const mockUser = {
        id: "123",
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        password: "hashedPassword",
        birthdate: new Date("1990-01-01"),
    };
    beforeEach(() => {
        jest.clearAllMocks(); // Nettoyer les mocks avant chaque test
    });
    // ✅ Test de l'inscription d'un utilisateur
    it("should register a user successfully", () => __awaiter(void 0, void 0, void 0, function* () {
        prisma.user.findUnique.mockResolvedValue(null);
        prisma.user.create.mockResolvedValue(mockUser);
        const userData = {
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@example.com",
            password: "password123",
            birthdate: "1990-01-01",
        };
        const user = yield (0, authService_1.registerUser)(userData);
        expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: "john.doe@example.com" } });
        expect(bcryptjs_1.default.hash).toHaveBeenCalledWith("password123", 10);
        expect(prisma.user.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                firstName: "John",
                lastName: "Doe",
                email: "john.doe@example.com",
                password: "hashedPassword",
                birthdate: new Date("1990-01-01"),
            }),
        });
        expect(user).toEqual(mockUser);
    }));
    // ❌ Test d'erreur si l'email est déjà utilisé
    it("should throw an error if email is already in use", () => __awaiter(void 0, void 0, void 0, function* () {
        prisma.user.findUnique.mockResolvedValue(mockUser);
        const userData = {
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@example.com",
            password: "password123",
            birthdate: "1990-01-01",
        };
        yield expect((0, authService_1.registerUser)(userData)).rejects.toThrow("Email is already in use");
    }));
    // ✅ Test de connexion réussie
    it("should log in a user successfully", () => __awaiter(void 0, void 0, void 0, function* () {
        prisma.user.findUnique.mockResolvedValue(mockUser);
        bcryptjs_1.default.compare.mockResolvedValue(true);
        const credentials = { email: "john.doe@example.com", password: "password123" };
        const user = yield (0, authService_1.loginUser)(credentials);
        expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: "john.doe@example.com" } });
        expect(bcryptjs_1.default.compare).toHaveBeenCalledWith("password123", "hashedPassword");
        expect(user).toEqual({ id: "123", email: "john.doe@example.com" });
    }));
    // ❌ Test d'erreur si l'utilisateur n'existe pas
    it("should throw an error if user is not found", () => __awaiter(void 0, void 0, void 0, function* () {
        prisma.user.findUnique.mockResolvedValue(null);
        const credentials = { email: "john.doe@example.com", password: "password123" };
        yield expect((0, authService_1.loginUser)(credentials)).rejects.toThrow("Invalid credentials");
    }));
    // ❌ Test d'erreur si le mot de passe est incorrect
    it("should throw an error if password is incorrect", () => __awaiter(void 0, void 0, void 0, function* () {
        prisma.user.findUnique.mockResolvedValue(mockUser);
        bcryptjs_1.default.compare.mockResolvedValue(false);
        const credentials = { email: "john.doe@example.com", password: "wrongpassword" };
        yield expect((0, authService_1.loginUser)(credentials)).rejects.toThrow("Invalid credentials");
    }));
});
