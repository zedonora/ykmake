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