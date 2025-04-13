# 빌드 스테이지
FROM node:18-alpine as builder

WORKDIR /app

# 의존성 설치
COPY package*.json ./
RUN npm ci

# 소스 코드 복사 및 빌드
COPY . .
RUN npm run build

# 프로덕션 스테이지
FROM node:18-alpine

WORKDIR /app

# 프로덕션 의존성만 설치
COPY package*.json ./
RUN npm ci --production

# 빌드된 파일 복사
COPY --from=builder /app/build ./build
COPY --from=builder /app/public ./public

# 환경 변수 설정
ENV NODE_ENV=production

# 포트 설정
EXPOSE 3000

# 서버 실행
CMD ["npm", "start"]