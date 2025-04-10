import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Card } from "~/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { getUsers } from "~/lib/data/mock-admin";
import type { User } from "~/lib/types/admin";

export const meta: MetaFunction = () => {
    return [
        { title: "사용자 관리 - YkMake" },
        { name: "description", content: "YkMake 사용자를 관리하세요" },
    ];
};

export async function loader() {
    const users = getUsers();
    return { users };
}

export default function UserManagement() {
    const { users } = useLoaderData<typeof loader>();

    return (
        <div className="container py-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">사용자 관리</h1>
                <div className="flex items-center gap-4">
                    <Input
                        className="w-[300px]"
                        placeholder="이름 또는 이메일로 검색"
                    />
                    <Button>새 사용자</Button>
                </div>
            </div>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>이름</TableHead>
                            <TableHead>이메일</TableHead>
                            <TableHead>역할</TableHead>
                            <TableHead>상태</TableHead>
                            <TableHead>가입일</TableHead>
                            <TableHead>작업</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user: User) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.id}</TableCell>
                                <TableCell className="font-medium">{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Badge variant={user.role === "관리자" ? "default" : "secondary"}>
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={user.status === "활성" ? "default" : "destructive"}>
                                        {user.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>{user.joinedAt}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm">
                                            수정
                                        </Button>
                                        <Button variant="destructive" size="sm">
                                            삭제
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}