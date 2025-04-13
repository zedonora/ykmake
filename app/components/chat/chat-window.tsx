import { useEffect, useState, useRef } from "react";
import { getSocket } from "~/utils/socket.client";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";

type Message = {
    id: string;
    userId: string;
    userName: string;
    content: string;
    createdAt: string;
};

type ChatWindowProps = {
    roomId: string;
    roomType: "team" | "direct";
};

export function ChatWindow({ roomId, roomType }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const socket = getSocket();

        socket.emit("join_room", { roomId, roomType });

        socket.on("message", (message: Message) => {
            setMessages((prev) => [...prev, message]);
            scrollToBottom();
        });

        return () => {
            socket.emit("leave_room", { roomId, roomType });
            socket.off("message");
        };
    }, [roomId, roomType]);

    const scrollToBottom = () => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    };

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const socket = getSocket();
        socket.emit("send_message", {
            roomId,
            roomType,
            content: newMessage,
        });

        setNewMessage("");
    };

    return (
        <div className="flex flex-col h-[600px] border rounded-lg">
            <div className="p-4 border-b">
                <h3 className="text-lg font-semibold">
                    {roomType === "team" ? "팀 채팅" : "개인 채팅"}
                </h3>
            </div>
            <ScrollArea
                ref={scrollAreaRef}
                className="flex-1 p-4"
            >
                <div className="space-y-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className="flex flex-col gap-1"
                        >
                            <div className="flex items-center gap-2">
                                <span className="font-semibold">
                                    {message.userName}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {new Date(message.createdAt).toLocaleString()}
                                </span>
                            </div>
                            <p className="text-sm">{message.content}</p>
                        </div>
                    ))}
                </div>
            </ScrollArea>
            <form
                onSubmit={sendMessage}
                className="p-4 border-t flex gap-2"
            >
                <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="메시지를 입력하세요..."
                    className="flex-1"
                />
                <Button type="submit">전송</Button>
            </form>
        </div>
    );
}