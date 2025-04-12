import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
    // 관리자 계정 생성
    const adminPassword = await bcrypt.hash("admin1234", 10);
    const admin = await prisma.user.create({
        data: {
            email: "admin@example.com",
            name: "관리자",
            password: adminPassword,
            role: "ADMIN",
        },
    });

    // 일반 사용자 계정 생성
    const userPassword = await bcrypt.hash("user1234", 10);
    const user = await prisma.user.create({
        data: {
            email: "user@example.com",
            name: "홍길동",
            password: userPassword,
            role: "USER",
        },
    });

    // 제품 데이터 생성
    const product1 = await prisma.product.create({
        data: {
            title: "AI 챗봇",
            description: "OpenAI API를 활용한 대화형 AI 챗봇",
            category: "AI",
            views: 523,
            authorId: user.id,
        },
    });

    // 팀 데이터 생성
    const team = await prisma.team.create({
        data: {
            name: "AI 개발팀",
            description: "AI 기반 제품 개발 팀",
            category: "development",
            status: "recruiting",
        },
    });

    // 팀 멤버 추가
    await prisma.teamMember.create({
        data: {
            role: "OWNER",
            userId: user.id,
            teamId: team.id,
        },
    });

    console.log(`데이터베이스 시드 완료`);
}

seed()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });