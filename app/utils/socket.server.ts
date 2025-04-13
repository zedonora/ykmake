import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import { getUser } from "./session.server";
import { prisma } from "./api.server";

let io: Server;

export function initSocketIO(httpServer: HttpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.NODE_ENV === "production"
                ? "https://ykmake.com"
                : "http://localhost:3000",
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    io.use(async (socket, next) => {
        const cookie = socket.handshake.headers.cookie;
        if (!cookie) {
            return next(new Error("No cookie"));
        }

        try {
            const fakeRequest = new Request("http://localhost", {
                headers: new Headers({
                    cookie
                })
            });

            const user = await getUser(fakeRequest);

            if (!user) {
                return next(new Error("Unauthorized"));
            }

            socket.data.user = user;
            next();
        } catch (error) {
            next(error as Error);
        }
    });

    io.on("connection", (socket) => {
        const userId = socket.data.user.id;
        socket.join(`user:${userId}`);

        socket.on("disconnect", () => {
            socket.leave(`user:${userId}`);
        });
    });

    return io;
}

export function getIO() {
    if (!io) {
        throw new Error("Socket.IO not initialized");
    }
    return io;
}