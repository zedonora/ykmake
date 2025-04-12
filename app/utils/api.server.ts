import { PrismaClient } from "@prisma/client";
import { getSession } from "~/utils/session.server";

const prisma = new PrismaClient();

export { prisma };

export async function requireUser(request: Request) {
    const session = await getSession(request);
    const userId = session.get("userId");

    if (!userId) {
        throw new Response(JSON.stringify({ message: "로그인이 필요합니다" }), {
            status: 401,
            headers: {
                "Content-Type": "application/json"
            }
        });
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new Response(JSON.stringify({ message: "사용자를 찾을 수 없습니다" }), {
            status: 404,
            headers: {
                "Content-Type": "application/json"
            }
        });
    }

    return user;
}

export async function requireAdmin(request: Request) {
    const user = await requireUser(request);

    if (user.role !== "ADMIN") {
        throw new Response(JSON.stringify({ message: "관리자 권한이 필요합니다" }), {
            status: 403,
            headers: {
                "Content-Type": "application/json"
            }
        });
    }

    return user;
}

export async function incrementProductViews(productId: string) {
    return prisma.product.update({
        where: { id: productId },
        data: { views: { increment: 1 } }
    });
}