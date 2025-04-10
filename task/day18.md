# Day 18: 실제 서버 배포 및 테스트

## 목표

오늘은 YkMake를 실제 서버에 배포하고 테스트를 진행합니다. 프로덕션 환경에서 안정적으로 서비스가 운영되는지 확인합니다.

## 작업 목록

1. 서버 환경 구성
2. SSL 인증서 설정
3. 배포 자동화
4. 테스트 진행

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

    # 보안 헤더 설정
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy strict-origin-when-cross-origin;

    # 업스트림 서버 설정
    upstream app_servers {
        server app:3000;
    }

    # HTTPS 서버 설정
    server {
        listen 443 ssl http2;
        server_name ykmake.com;

        ssl_certificate /etc/nginx/ssl/live/ykmake.com/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/live/ykmake.com/privkey.pem;
        ssl_session_timeout 1d;
        ssl_session_cache shared:SSL:50m;
        ssl_session_tickets off;

        # 현대적인 SSL 설정
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;

        # HSTS 설정
        add_header Strict-Transport-Security "max-age=63072000" always;

        # 정적 파일 설정
        location /static {
            alias /app/public;
            expires 30d;
            add_header Cache-Control "public, no-transform";
        }

        # 프록시 설정
        location / {
            proxy_pass http://app_servers;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            # WebSocket 지원
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }
    }

    # HTTP를 HTTPS로 리다이렉트
    server {
        listen 80;
        server_name ykmake.com;
        return 301 https://$server_name$request_uri;
    }
}
```

## 2. SSL 인증서 설정

### Certbot 설정

`docker-compose.yml` 파일에 Certbot 서비스를 추가합니다:

```yaml
services:
  # ... 기존 서비스 ...

  certbot:
    image: certbot/certbot
    volumes:
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    command: certonly --webroot -w /var/www/certbot --email admin@ykmake.com -d ykmake.com --agree-tos

  nginx:
    image: nginx:1.25-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx:/etc/nginx
      - ./certbot/conf:/etc/nginx/ssl
      - ./certbot/www:/var/www/certbot
    depends_on:
      - app
```

### SSL 인증서 자동 갱신 스크립트

`scripts/renew-cert.sh` 파일을 생성하고 다음과 같이 구현합니다:

```bash
#!/bin/bash

# SSL 인증서 갱신
docker-compose run --rm certbot renew

# Nginx 재시작
docker-compose exec nginx nginx -s reload
```

## 3. 배포 자동화

### 배포 스크립트

`scripts/deploy.sh` 파일을 생성하고 다음과 같이 구현합니다:

```bash
#!/bin/bash

# 환경 변수 로드
set -a
source .env.production
set +a

# Git 최신 코드 가져오기
git pull origin main

# 이전 빌드 정리
docker-compose down

# 새로운 이미지 빌드
docker-compose build

# 서비스 시작
docker-compose up -d

# 데이터베이스 마이그레이션
docker-compose exec app npx prisma migrate deploy

# 헬스 체크
echo "Waiting for services to start..."
sleep 10

# 헬스 체크 함수
check_health() {
  local url=$1
  local service=$2
  local max_attempts=30
  local attempt=1

  while [ $attempt -le $max_attempts ]; do
    if curl -f "$url" > /dev/null 2>&1; then
      echo "$service is healthy"
      return 0
    fi
    echo "Attempt $attempt: $service is not ready yet..."
    sleep 5
    attempt=$((attempt + 1))
  done

  echo "$service failed to become healthy"
  return 1
}

# 각 서비스 헬스 체크
check_health "https://ykmake.com/health" "App" || exit 1
check_health "http://localhost:9090/-/healthy" "Prometheus" || exit 1
check_health "http://localhost:3001/api/health" "Grafana" || exit 1

echo "Deployment completed successfully!"
```

### 롤백 스크립트

`scripts/rollback.sh` 파일을 생성하고 다음과 같이 구현합니다:

```bash
#!/bin/bash

# 이전 버전 태그 가져오기
PREVIOUS_TAG=$(git describe --abbrev=0 --tags HEAD^)

# 이전 버전으로 체크아웃
git checkout $PREVIOUS_TAG

# 서비스 재시작
docker-compose down
docker-compose up -d

echo "Rolled back to version $PREVIOUS_TAG"
```

## 4. 테스트 진행

### 성능 테스트 스크립트

`scripts/performance-test.js` 파일을 생성하고 다음과 같이 구현합니다:

```javascript
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "1m", target: 50 },  // 1분 동안 50명의 동시 사용자로 증가
    { duration: "3m", target: 50 },  // 3분 동안 50명 유지
    { duration: "1m", target: 100 }, // 1분 동안 100명으로 증가
    { duration: "3m", target: 100 }, // 3분 동안 100명 유지
    { duration: "1m", target: 0 },   // 1분 동안 0명으로 감소
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"], // 95%의 요청이 500ms 이내 완료
    http_req_failed: ["rate<0.01"],   // 실패율 1% 미만
  },
};

const BASE_URL = "https://ykmake.com";

export default function () {
  // 메인 페이지 로드
  const homeRes = http.get(BASE_URL);
  check(homeRes, {
    "홈페이지 로드 성공": (r) => r.status === 200,
    "홈페이지 로드 시간 < 2s": (r) => r.timings.duration < 2000,
  });

  sleep(1);

  // 제품 목록 페이지 로드
  const productsRes = http.get(`${BASE_URL}/products`);
  check(productsRes, {
    "제품 목록 로드 성공": (r) => r.status === 200,
    "제품 목록 로드 시간 < 2s": (r) => r.timings.duration < 2000,
  });

  sleep(1);

  // 팀 목록 페이지 로드
  const teamsRes = http.get(`${BASE_URL}/teams`);
  check(teamsRes, {
    "팀 목록 로드 성공": (r) => r.status === 200,
    "팀 목록 로드 시간 < 2s": (r) => r.timings.duration < 2000,
  });

  sleep(1);
}
```

### 보안 테스트 스크립트

`scripts/security-test.sh` 파일을 생성하고 다음과 같이 구현합니다:

```bash
#!/bin/bash

# OWASP ZAP을 사용한 보안 스캔
docker run --rm \
  -v $(pwd)/security-reports:/zap/wrk/:rw \
  -t owasp/zap2docker-stable zap-baseline.py \
  -t https://ykmake.com \
  -g gen.conf \
  -r security-report.html

# SSL 설정 검사
docker run --rm drwetter/testssl.sh \
  --severity HIGH \
  --quiet \
  --csv \
  ykmake.com:443 > security-reports/ssl-report.csv

# 헤더 보안 검사
curl -s -D - https://ykmake.com -o /dev/null | \
  grep -E "^(Strict-Transport-Security|X-Frame-Options|X-Content-Type-Options|X-XSS-Protection|Content-Security-Policy|Referrer-Policy):"
```

## 다음 단계

이제 서버 배포와 테스트의 기본적인 구조가 완성되었습니다! 다음 단계에서는 서비스 안정화와 최적화 작업을 진행할 예정입니다.

배포와 테스트가 잘 구성되었는지 확인해보세요:

```bash
# 배포 스크립트 실행
chmod +x scripts/*.sh
./scripts/deploy.sh

# 성능 테스트 실행
k6 run scripts/performance-test.js

# 보안 테스트 실행
./scripts/security-test.sh
```

이제 다음과 같은 기능들이 구축되었습니다:
- Nginx를 통한 프록시 및 SSL 설정
- 자동화된 SSL 인증서 관리
- CI/CD 파이프라인 구성
- 성능 및 보안 테스트 자동화
``` 