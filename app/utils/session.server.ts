import { createCookieSessionStorage, redirect } from "@remix-run/node";
import bcrypt from "bcryptjs";
import { prisma } from "~/utils/api.server";

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
    throw new Error("SESSION_SECRET must be set");
}

const storage = createCookieSessionStorage({
    cookie: {
        name: "YkMake_session",
        secure: process.env.NODE_ENV === "production",
        secrets: [sessionSecret],
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30일
        httpOnly: true,
    },
});

export async function createUserSession(userId: string, redirectTo: string) {
    const session = await storage.getSession();
    session.set("userId", userId);
    return redirect(redirectTo, {
        headers: {
            "Set-Cookie": await storage.commitSession(session),
        },
    });
}

export async function getSession(request: Request) {
    return storage.getSession(request.headers.get("Cookie"));
}

export async function getUserId(request: Request) {
    const session = await getSession(request);
    const userId = session.get("userId");
    if (!userId || typeof userId !== "string") return null;
    return userId;
}

export async function getUser(request: Request) {
    const userId = await getUserId(request);
    if (!userId) return null;

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, name: true, role: true },
        });
        return user;
    } catch {
        throw await logout(request);
    }
}

export async function logout(request: Request) {
    const session = await getSession(request);
    return redirect("/", {
        headers: {
            "Set-Cookie": await storage.destroySession(session),
        },
    });
}

export async function register({
    email,
    password,
    name
}: {
    email: string;
    password: string;
    name: string;
}) {
    const hashedPassword = await bcrypt.hash(password, 10);

    return prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name
        },
    });
}

export async function login({
    email,
    password
}: {
    email: string;
    password: string;
}) {
    const user = await prisma.user.findUnique({
        where: { email },
    });
    if (!user) return null;

    const isCorrectPassword = await bcrypt.compare(password, user.password);
    if (!isCorrectPassword) return null;

    return user;
}