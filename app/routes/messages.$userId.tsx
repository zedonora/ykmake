import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { getConversation } from "~/lib/data/mock-messages";
import type { Message, User } from "~/lib/types/message";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
    if (!data || !data.user) {
        return [
            { title: "메시지 - YkMake" },
            { name: "description", content: "대화를 시작하세요" },
        ];
    }

    return [
        { title: `${data.user.name}와의 대화 - YkMake` },
        { name: "description", content: `YkMake에서 ${data.user.name}님과 대화하세요` },
    ];
};

export async function loader({ params }: LoaderFunctionArgs) {
    const userId = params.userId as string;
    const { messages, user } = getConversation(userId);

    return { messages, user };
}

export default function MessageDetail() {
    const { messages, user } = useLoaderData<typeof loader>();

    return (
        <Card className="flex flex-col h-[calc(100vh-8rem)]">
            <div className="flex items-center gap-4 p-4 border-b">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`} />
                    <AvatarFallback>{user?.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-sm text-muted-foreground">
                        {user?.status === 'online' ? '온라인' :
                            user?.status === 'away' ? '자리비움' : '오프라인'}
                    </p>
                </div>
            </div>

            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {messages.map((message: Message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.senderId === 'current-user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`rounded-lg p-3 max-w-[70%] ${message.senderId === 'current-user'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                                }`}
                        >
                            <p>{message.content}</p>
                            <p className="text-xs mt-1 opacity-70">
                                {message.timestamp.includes('T')
                                    ? new Date(message.timestamp).toLocaleTimeString('ko-KR', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })
                                    : message.timestamp}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 border-t">
                <form className="flex gap-4">
                    <Input
                        className="flex-1"
                        placeholder="메시지를 입력하세요..."
                    />
                    <Button type="submit">보내기</Button>
                </form>
            </div>
        </Card>
    );
}