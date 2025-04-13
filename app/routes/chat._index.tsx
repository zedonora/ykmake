import { useState } from "react";
import { PageHeader } from "~/components/layouts/page-header";
import { Section } from "~/components/layouts/section";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ChatWindow } from "~/components/chat/chat-window";

export default function ChatIndexPage() {
    const [activeTab, setActiveTab] = useState("teams");

    return (
        <>
            <PageHeader title="채팅" description="팀원들과 실시간으로 대화하세요" />
            <Section>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-4">
                        <TabsTrigger value="teams">팀 채팅</TabsTrigger>
                        <TabsTrigger value="direct">개인 채팅</TabsTrigger>
                    </TabsList>
                    <TabsContent value="teams">
                        <Card>
                            <CardHeader>
                                <CardTitle>팀 채팅</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ChatWindow roomId="team-1" roomType="team" />
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="direct">
                        <Card>
                            <CardHeader>
                                <CardTitle>개인 채팅</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ChatWindow roomId="user-1" roomType="direct" />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </Section>
        </>
    );
}