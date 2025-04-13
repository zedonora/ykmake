import { io } from "socket.io-client";

const socket = io(
    process.env.NODE_ENV === "production"
        ? "https://ykmake.com"
        : "http://localhost:3000",
    {
        withCredentials: true,
    }
);

export function initSocketClient() {
    socket.on("connect", () => {
        console.log("Connected to WebSocket server");
    });

    socket.on("disconnect", () => {
        console.log("Disconnected from WebSocket server");
    });

    return socket;
}

export function getSocket() {
    return socket;
}