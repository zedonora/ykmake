#!/bin/bash

COMPOSE_PROJECT_NAME=ykmake # docker-compose 프로젝트 이름 (필요시 수정)

echo "Attempting to renew SSL certificates..."

# Docker Compose 명령어 실행
docker compose -p ${COMPOSE_PROJECT_NAME} run --rm --entrypoint="" certbot renew --webroot -w /var/www/certbot --quiet && \
echo "Reloading Nginx configuration..." && \
docker compose -p ${COMPOSE_PROJECT_NAME} exec nginx nginx -s reload

echo "Certificate renewal process finished."