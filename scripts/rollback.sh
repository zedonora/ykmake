#!/bin/bash

set -e

# 환경 변수 로드 (docker-compose 프로젝트 이름 등 필요시)
# ENV_FILE=".env.production"
# if [ -f "$ENV_FILE" ]; then
#   set -a
#   source "$ENV_FILE"
#   set +a
# fi
# COMPOSE_PROJECT_NAME=ykmake

# 이전 Git 태그 또는 커밋 해시로 롤백
# 여기서는 가장 최근 태그로 롤백하는 예시
PREVIOUS_TAG=$(git describe --tags --abbrev=0 HEAD~1 2>/dev/null)

if [ -z "$PREVIOUS_TAG" ]; then
  echo "Error: Could not find previous tag."
  # 또는 특정 커밋으로 롤백
  # PREVIOUS_COMMIT=$(git rev-parse HEAD~1)
  # if [ -z "$PREVIOUS_COMMIT" ]; then
  #   echo "Error: Could not find previous commit."
  #   exit 1
  # fi
  # echo "Rolling back to previous commit: $PREVIOUS_COMMIT"
  # git checkout $PREVIOUS_COMMIT
  exit 1
fi

echo "Rolling back to previous version: $PREVIOUS_TAG"
git checkout $PREVIOUS_TAG

# Docker 이미지 재빌드 및 서비스 재시작
# (롤백 시 이전 이미지가 있다면 build 생략 가능)
echo "Rebuilding and restarting services for version $PREVIOUS_TAG..."
docker compose build # 필요시 빌드
docker compose down
docker compose up -d

# 필요시 데이터베이스 롤백 마이그레이션 실행
# echo "Running database rollback migrations (if applicable)..."
# docker compose exec app npx prisma migrate down ...

echo "Rollback to version $PREVIOUS_TAG completed."
exit 0