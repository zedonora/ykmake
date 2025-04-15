# Day 18: 실제 서버 배포 및 테스트

## 목표

오늘은 YkMake를 실제 서버에 배포하고 테스트를 진행합니다. 프로덕션 환경에서 안정적으로 서비스가 운영되는지 확인합니다.

## 파일 생성 명령어

다음 명령어를 실행하여 필요한 파일들을 생성합니다:

```bash
mkdir -p nginx certbot/conf certbot/www scripts security-reports
touch nginx/nginx.conf
touch scripts/renew-cert.sh
touch scripts/deploy.sh
touch scripts/rollback.sh
touch scripts/performance-test.js
touch scripts/security-test.sh
# docker-compose.yml은 Day 17에서 생성/수정되었으므로 여기서는 업데이트만 합니다.
```

## 필수 라이브러리 설치 (및 도구)

성능 테스트를 위해 k6 도구를 설치해야 합니다. 아래 공식 문서를 참고하여 시스템에 맞게 설치하세요.
- [k6 설치 가이드](https://k6.io/docs/getting-started/installation/)

```bash
brew install k6
```

보안 테스트를 위해 Docker가 설치되어 있어야 합니다.

## 작업 목록

1. 서버 환경 구성 (Nginx)
2. SSL 인증서 설정 (Certbot)
3. 배포 자동화 (스크립트)
4. 테스트 진행 (k6, ZAP, testssl.sh)

## 1. 서버 환경 구성

### Nginx 설정

`nginx/nginx.conf` 파일을 생성하고 다음과 같이 구현합니다:

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # GZIP 압축 설정
    gzip on;
    gzip_disable "msie6";
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # 보안 헤더 설정 (Day 16 entry.server.tsx 설정과 중복될 수 있으나, Nginx에서 추가하는 것이 더 안전)
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;
    # Content-Security-Policy는 애플리케이션 특성에 맞게 더 상세히 설정 필요
    # add_header Content-Security-Policy "default-src 'self'; ..." always;

    # 업스트림 서버 설정 (Docker Compose 서비스 이름 사용)
    upstream app_servers {
        # server app:3000; # Day 17 docker-compose.yml의 app 서비스
        # 로드 밸런싱 필요 시 여러 서버 추가 가능
        server host.docker.internal:3000; # Docker Desktop 외부 접근 시 (개발 환경)
        # server 172.17.0.1:3000; # Docker 브릿지 네트워크 IP (환경 따라 다름)
    }

    # HTTPS 서버 설정
    server {
        listen 443 ssl http2;
        # server_name your-domain.com; # 실제 도메인으로 변경
        server_name ykmake.com; # 예시 도메인

        # SSL 인증서 경로 (certbot 볼륨 마운트 경로와 일치)
        ssl_certificate /etc/letsencrypt/live/ykmake.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/ykmake.com/privkey.pem;
        include /etc/letsencrypt/options-ssl-nginx.conf; # 권장 SSL 파라미터 포함 (Certbot 생성)
        ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # 권장 DH 파라미터 포함 (Certbot 생성)

        # ssl_session_timeout 1d;
        # ssl_session_cache shared:SSL:50m;
        # ssl_session_tickets off;
        # ssl_protocols TLSv1.2 TLSv1.3; # options-ssl-nginx.conf 에 포함됨
        # ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:...; # options-ssl-nginx.conf 에 포함됨
        # ssl_prefer_server_ciphers off;

        # HSTS 설정 (preload 등록 시 주의)
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

        # 정적 파일 직접 서빙 (선택 사항, Remix 앱에서 처리 가능)
        # location /static {
        #     alias /app/public; # 실제 public 경로 확인 필요
        #     expires 30d;
        #     add_header Cache-Control "public, no-transform";
        # }

        # 프록시 설정
        location / {
            proxy_pass http://app_servers; # 업스트림 이름 사용
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host; # 원래 호스트 헤더 전달
            proxy_cache_bypass $http_upgrade;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header X-Forwarded-Host $host;
            proxy_set_header X-Forwarded-Port $server_port;

            # WebSocket 지원 (Remix 기본 지원)
            # proxy_set_header Upgrade $http_upgrade;
            # proxy_set_header Connection "upgrade";
        }

        # Certbot 웹 루트 경로 설정 (.well-known/acme-challenge)
        location ~ /.well-known/acme-challenge/ {
            allow all;
            root /var/www/certbot; # certbot 서비스 볼륨과 동일
        }
    }

    # HTTP를 HTTPS로 리다이렉트
    server {
        listen 80;
        # server_name your-domain.com; # 실제 도메인으로 변경
        server_name ykmake.com;

        # Certbot 챌린지 요청은 리다이렉트하지 않음
        location ~ /.well-known/acme-challenge/ {
            allow all;
            root /var/www/certbot;
        }

        location / {
            return 301 https://$host$request_uri; # $host 사용 권장
        }
    }
}
```

## 2. SSL 인증서 설정

### Certbot 설정

`docker-compose.yml` 파일에 Certbot 및 Nginx 서비스를 추가/수정합니다. (Day 17 내용에 이어서)

```yaml
services:
  # ... 기존 서비스 (app, db, cache, minio, prometheus, grafana 등) ...

  nginx:
    image: nginx:1.25-alpine
    container_name: nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro # 읽기 전용 마운트
      - ./certbot/conf:/etc/letsencrypt # certbot과 공유 (인증서)
      - ./certbot/www:/var/www/certbot # certbot과 공유 (웹 루트 챌린지)
      - ./logs/nginx:/var/log/nginx # Nginx 로그
    depends_on:
      - app # 앱 서버가 실행된 후 시작
    restart: unless-stopped

  certbot:
    image: certbot/certbot:v2.8.0 # 버전 명시 권장
    container_name: certbot
    volumes:
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
      - ./logs/letsencrypt:/var/log/letsencrypt # Let's Encrypt 로그
    # 처음 실행 시 인증서 발급 명령어 (도메인, 이메일 수정 필요)
    # entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;" # 자동 갱신 (주석 처리)
    command: certonly --webroot -w /var/www/certbot --email your-email@example.com --agree-tos --no-eff-email -d ykmake.com
    # 주의: 위 command는 첫 실행 시 인증서 발급용입니다.
    # 발급 성공 후에는 아래 entrypoint로 변경하여 자동 갱신 모드로 실행해야 합니다.
    # 또는 cron job 등을 이용해 외부에서 renew 명령을 주기적으로 실행합니다.
    # entrypoint: ["/bin/sh", "-c", "sleep infinity"]

volumes:
  # ... 기존 볼륨 ...
  postgres_data:
  redis_data:
  minio_data:
  prometheus_data:
  grafana_data:
  # certbot 볼륨은 호스트 경로에 직접 마운트되므로 별도 정의 필요 없음
```

**주의:**
- Nginx 설정에서 `server_name`, SSL 인증서 경로의 도메인(`ykmake.com`)을 실제 도메인으로 변경해야 합니다.
- Certbot `command`의 이메일 주소와 도메인을 실제 정보로 변경해야 합니다.
- 처음 인증서를 발급받은 후, `certbot` 서비스의 `command`를 주석 처리하고 `entrypoint`를 사용하여 자동 갱신 모드로 실행하거나, 호스트 시스템의 cron 등을 이용하여 `scripts/renew-cert.sh` 스크립트를 주기적으로 실행해야 합니다.

### SSL 인증서 자동 갱신 스크립트

`scripts/renew-cert.sh` 파일을 생성하고 다음과 같이 구현합니다:

```bash
#!/bin/bash

COMPOSE_PROJECT_NAME=ykmake # docker-compose 프로젝트 이름 (필요시 수정)

echo "Attempting to renew SSL certificates..."

# Docker Compose 명령어 실행
docker compose -p ${COMPOSE_PROJECT_NAME} run --rm --entrypoint=""
 certbot renew --webroot -w /var/www/certbot --quiet && \
echo "Reloading Nginx configuration..." && \
docker compose -p ${COMPOSE_PROJECT_NAME} exec nginx nginx -s reload

echo "Certificate renewal process finished."
```

## 3. 배포 자동화

### 배포 스크립트

`scripts/deploy.sh` 파일을 생성하고 다음과 같이 구현합니다:

```bash
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
```

### 롤백 스크립트

`scripts/rollback.sh` 파일을 생성하고 다음과 같이 구현합니다:

```bash
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
```

## 4. 테스트 진행

### 성능 테스트 스크립트

`scripts/performance-test.js` 파일을 생성하고 다음과 같이 구현합니다 (k6 필요):

```javascript
import http from "k6/http";
import { check, sleep, group } from "k6";

// 테스트 옵션 설정
export const options = {
  stages: [
    { duration: "30s", target: 20 },  // 30초 동안 사용자 20명으로 증가 (Warm-up)
    { duration: "1m", target: 50 },   // 1분 동안 50명으로 증가
    { duration: "2m", target: 50 },   // 2분 동안 50명 유지 (Load)
    { duration: "1m", target: 100 },  // 1분 동안 100명으로 증가 (Stress)
    { duration: "2m", target: 100 },  // 2분 동안 100명 유지
    { duration: "30s", target: 0 },   // 30초 동안 0명으로 감소 (Cool-down)
  ],
  thresholds: {
    // 95%의 요청 응답 시간이 500ms 미만이어야 함
    http_req_duration: ["p(95)<500"],
    // 99%의 요청 응답 시간이 1000ms 미만이어야 함
    http_req_duration: ["p(99)<1000"],
    // 실패한 요청 비율이 1% 미만이어야 함
    http_req_failed: ["rate<0.01"],
    // 특정 그룹의 응답 시간 임계값 설정 (선택 사항)
    'http_req_duration{group:::홈페이지 로드}': ['max<1500'],
  },
  // 실행 환경 변수 사용 (예: k6 run -e BASE_URL=https://your-staging.com script.js)
  baseUrl: __ENV.BASE_URL || "https://ykmake.com", // 기본 URL 설정
};

// 테스트 함수
export default function () {
  const baseUrl = options.baseUrl;

  group("홈페이지 로드", function () {
    const res = http.get(`${baseUrl}/`);
    check(res, {
      "상태 코드 200": (r) => r.status === 200,
      "응답 시간 < 1.5s": (r) => r.timings.duration < 1500,
    });
  });

  sleep(Math.random() * 3 + 1); // 1~4초 사이 랜덤 대기

  group("제품 목록 페이지 로드", function () {
    const res = http.get(`${baseUrl}/products`);
    check(res, {
      "상태 코드 200": (r) => r.status === 200,
      "응답 시간 < 2s": (r) => r.timings.duration < 2000,
    });
  });

  sleep(Math.random() * 3 + 1);

  group("팀 목록 페이지 로드", function () {
    const res = http.get(`${baseUrl}/teams`);
    check(res, {
      "상태 코드 200": (r) => r.status === 200,
      "응답 시간 < 2s": (r) => r.timings.duration < 2000,
    });
  });

  sleep(Math.random() * 3 + 1);

  // 추가적인 API 요청 또는 시나리오 테스트...
  // 예: 로그인, 글 작성 등
}
```

### 보안 테스트 스크립트

`scripts/security-test.sh` 파일을 생성하고 다음과 같이 구현합니다 (Docker 필요):

```bash
#!/bin/bash

set -e

TARGET_URL="https://ykmake.com" # 대상 URL 수정
REPORT_DIR="security-reports"

mkdir -p $REPORT_DIR

echo "Starting security tests for $TARGET_URL..."

# 1. OWASP ZAP Baseline Scan
echo "Running OWASP ZAP baseline scan..."
docker run --rm \
  -v $(pwd)/$REPORT_DIR:/zap/wrk/:rw \
  -t ghcr.io/zaproxy/zaproxy:stable zap-baseline.py \
  -t $TARGET_URL \
  -g zap-baseline-report.conf \
  -r zap-baseline-report.html \
  -J zap-baseline-report.json || echo "ZAP scan finished with potential issues."

# 2. SSL/TLS Configuration Test (testssl.sh)
echo "Running SSL/TLS configuration scan with testssl.sh..."
docker run --rm -ti drwetter/testssl.sh:latest --quiet --color 0 $TARGET_URL > $REPORT_DIR/testssl_report.txt
# docker run --rm -ti drwetter/testssl.sh:latest --jsonfile $REPORT_DIR/testssl_report.json $TARGET_URL

# 3. Security Headers Check
echo "Checking security headers..."
curl -s -I -L $TARGET_URL > $REPORT_DIR/headers_report.txt

echo "Security Headers Found:"
(grep -iE '^(Strict-Transport-Security|X-Frame-Options|X-Content-Type-Options|X-XSS-Protection|Content-Security-Policy|Referrer-Policy|Permissions-Policy):' $REPORT_DIR/headers_report.txt || echo "No standard security headers found or curl failed.")

echo "------------------------------------"
echo " Security tests completed. Reports are in '$REPORT_DIR' "
echo "------------------------------------"

exit 0
```

## 다음 단계

이제 서버 배포와 테스트의 기본적인 구조가 완성되었습니다! 다음 단계에서는 서비스 안정화와 최적화 작업을 진행할 예정입니다.

배포와 테스트가 잘 구성되었는지 확인해보세요:

```bash
# 스크립트 실행 권한 부여
chmod +x scripts/*.sh

# 배포 스크립트 실행 (실제 서버에서 실행 전 충분한 테스트 필요)
# ./scripts/deploy.sh

# 성능 테스트 실행 (k6 설치 필요, URL 확인)
# k6 run scripts/performance-test.js

# 보안 테스트 실행 (Docker 필요, URL 확인)
# ./scripts/security-test.sh
```

이제 다음과 같은 기능들이 구축되었습니다:
- Nginx를 통한 리버스 프록시 및 기본적인 SSL 설정
- Certbot을 이용한 SSL 인증서 발급 및 갱신 기반 마련
- 배포 및 롤백을 위한 쉘 스크립트 예시
- k6를 이용한 성능 테스트 스크립트 예시
- Docker 기반의 보안 테스트 (ZAP, testssl.sh) 스크립트 예시
``` 