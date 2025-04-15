#!/bin/bash

# 에러 발생 시 스크립트 중단
set -e

# 환경 변수 파일 경로 (필요시 수정)
ENV_FILE=".env.production"

if [ ! -f "$ENV_FILE" ]; then
    echo "Error: Production environment file ($ENV_FILE) not found!"
    exit 1
fi

# 환경 변수 로드 (export)
set -a
source "$ENV_FILE"
set +a

COMPOSE_PROJECT_NAME=ykmake # docker-compose 프로젝트 이름

echo "Starting deployment process..."

# 1. Git 최신 코드 가져오기
echo "Pulling latest code from main branch..."
git checkout main # 메인 브랜치로 이동
git pull origin main

# 2. Docker 이미지 빌드 (변경 사항 있을 시)
echo "Building Docker images..."
docker compose -p ${COMPOSE_PROJECT_NAME} build

# 3. 서비스 내리기 (다운타임 최소화를 위해 필요시 다른 전략 사용)
echo "Stopping existing services..."
docker compose -p ${COMPOSE_PROJECT_NAME} down

# 4. 서비스 시작
echo "Starting new services..."
docker compose -p ${COMPOSE_PROJECT_NAME} up -d

# 5. 데이터베이스 마이그레이션
echo "Running database migrations..."
docker compose -p ${COMPOSE_PROJECT_NAME} exec -T app npx prisma migrate deploy

# 6. 서비스 헬스 체크 (선택 사항)
echo "Waiting for services to become healthy..."
sleep 15 # 서비스 시작 대기 시간 (조정 가능)

# 헬스 체크 함수 (간단 버전)
check_health() {
  local url=$1
  local service=$2
  echo "Checking health of $service at $url..."
  if curl --silent --fail --max-time 5 "$url" > /dev/null; then
    echo "$service is healthy."
    return 0
  else
    echo "Error: $service failed health check."
    # 실패 시 롤백 또는 알림 등의 로직 추가 가능
    return 1
  fi
}

# 실제 서비스 URL과 엔드포인트로 변경 필요
# check_health "https://ykmake.com/health" "App"
# check_health "http://localhost:9090/-/healthy" "Prometheus"
# check_health "http://localhost:3001/api/health" "Grafana"

echo "------------------------------------"
echo " Deployment completed successfully! "
echo "------------------------------------"

exit 0