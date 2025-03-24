import { loginUser, registerUser } from "./authService";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";



const prisma = new PrismaClient();

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
  it("should register a user successfully", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

    const userData = {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      password: "password123",
      birthdate: "1990-01-01",
    };

    const user = await registerUser(userData);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: "john.doe@example.com" } });
    expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
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
  });

  // ❌ Test d'erreur si l'email est déjà utilisé
  it("should throw an error if email is already in use", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

    const userData = {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      password: "password123",
      birthdate: "1990-01-01",
    };

    await expect(registerUser(userData)).rejects.toThrow("Email is already in use");
  });

  // ✅ Test de connexion réussie
  it("should log in a user successfully", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const credentials = { email: "john.doe@example.com", password: "password123" };

    const user = await loginUser(credentials);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: "john.doe@example.com" } });
    expect(bcrypt.compare).toHaveBeenCalledWith("password123", "hashedPassword");
    expect(user).toEqual({ id: "123", email: "john.doe@example.com" });
  });

  // ❌ Test d'erreur si l'utilisateur n'existe pas
  it("should throw an error if user is not found", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const credentials = { email: "john.doe@example.com", password: "password123" };

    await expect(loginUser(credentials)).rejects.toThrow("Invalid credentials");
  });

  // ❌ Test d'erreur si le mot de passe est incorrect
  it("should throw an error if password is incorrect", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const credentials = { email: "john.doe@example.com", password: "wrongpassword" };

    await expect(loginUser(credentials)).rejects.toThrow("Invalid credentials");
  });
});
