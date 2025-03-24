import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

interface UserCredentials {
    email: string;
    password: string;
}

interface RegisterUserInput extends UserCredentials {
    firstName: string;
    lastName: string;
    birthdate: string;
}

export async function loginUser({ email, password }: UserCredentials) {
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) throw new Error("Invalid credentials");

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) throw new Error("Invalid credentials");

        return { id: user.id, email: user.email };
    } catch (error) {
        throw error instanceof Error ? new Error(error.message) : new Error("An unexpected error occurred");
    }
}

export async function registerUser(userData: RegisterUserInput) {
    try {
        const { firstName, lastName, email, password, birthdate } = userData;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) throw new Error("Email is already in use");

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                password: hashedPassword,
                birthdate: new Date(birthdate),
            },
        });

        return user;
    } catch (error) {
        throw error instanceof Error ? new Error(error.message) : new Error("Internal Server Error");
    }
}
