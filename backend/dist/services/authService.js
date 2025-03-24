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
exports.loginUser = loginUser;
exports.registerUser = registerUser;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
function loginUser(_a) {
    return __awaiter(this, arguments, void 0, function* ({ email, password }) {
        try {
            const user = yield prisma.user.findUnique({ where: { email } });
            if (!user)
                throw new Error("Invalid credentials");
            const isPasswordValid = yield bcryptjs_1.default.compare(password, user.password);
            if (!isPasswordValid)
                throw new Error("Invalid credentials");
            return { id: user.id, email: user.email };
        }
        catch (error) {
            throw error instanceof Error ? new Error(error.message) : new Error("An unexpected error occurred");
        }
    });
}
function registerUser(userData) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { firstName, lastName, email, password, birthdate } = userData;
            const existingUser = yield prisma.user.findUnique({ where: { email } });
            if (existingUser)
                throw new Error("Email is already in use");
            const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
            const user = yield prisma.user.create({
                data: {
                    firstName,
                    lastName,
                    email,
                    password: hashedPassword,
                    birthdate: new Date(birthdate),
                },
            });
            return user;
        }
        catch (error) {
            throw error instanceof Error ? new Error(error.message) : new Error("Internal Server Error");
        }
    });
}
