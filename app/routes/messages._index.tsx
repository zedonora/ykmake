import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { getConversations } from "~/lib/data/mock-messages";

export const meta: MetaFunction = () => {
    return [
        { title: "메시지 - YkMake" },
        { name: "description", content: "YkMake의 메시지를 확인하세요" },
    ];
};

export async function loader() {
    const conversations = getConversations();
    return { conversations };
}

export default function Messages() {
    const { conversations } = useLoaderData<typeof loader>();

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">메시지</h1>
                <Input
                    className="max-w-xs"
                    placeholder="대화 검색"
                />
            </div>

            <div className="space-y-4">
                {conversations.map((conversation) => (
                    <Link key={conversation.id} to={`/messages/${conversation.user?.id}`}>
                        <Card className="p-4 hover:bg-muted/50 cursor-pointer">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${conversation.user?.id}`} />
                                    <AvatarFallback>{conversation.user?.name[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <p className="font-medium">{conversation.user?.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {conversation.lastMessage.timestamp.includes('T')
                                                ? new Date(conversation.lastMessage.timestamp).toLocaleDateString('ko-KR', {
                                                    month: 'short',
                                                    day: 'numeric'
                                                })
                                                : conversation.lastMessage.timestamp}
                                        </p>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {conversation.lastMessage.content}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}