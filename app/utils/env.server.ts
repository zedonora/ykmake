function getEnvVar(key: string): string {
    const value = process.env[key];
    if (!value) {
        throw new Error(`${key} must be set`);
    }
    return value;
}

export const ENV = {
    NODE_ENV: getEnvVar("NODE_ENV"),
    SESSION_SECRET: getEnvVar("SESSION_SECRET"),
    DATABASE_URL: getEnvVar("DATABASE_URL"),

    GITHUB_CLIENT_ID: getEnvVar("GITHUB_CLIENT_ID"),
    GITHUB_CLIENT_SECRET: getEnvVar("GITHUB_CLIENT_SECRET"),
    GOOGLE_CLIENT_ID: getEnvVar("GOOGLE_CLIENT_ID"),
    GOOGLE_CLIENT_SECRET: getEnvVar("GOOGLE_CLIENT_SECRET"),
    KAKAO_CLIENT_ID: getEnvVar("KAKAO_CLIENT_ID"),
    KAKAO_CLIENT_SECRET: getEnvVar("KAKAO_CLIENT_SECRET"),

    AWS_ACCESS_KEY_ID: getEnvVar("AWS_ACCESS_KEY_ID"),
    AWS_SECRET_ACCESS_KEY: getEnvVar("AWS_SECRET_ACCESS_KEY"),
    AWS_REGION: getEnvVar("AWS_REGION"),
    S3_BUCKET: getEnvVar("S3_BUCKET"),
    MINIO_ENDPOINT: getEnvVar("MINIO_ENDPOINT"),

    REDIS_URL: getEnvVar("REDIS_URL"),

    SMTP_HOST: getEnvVar("SMTP_HOST"),
    SMTP_PORT: getEnvVar("SMTP_PORT"),
    SMTP_USER: getEnvVar("SMTP_USER"),
    SMTP_PASS: getEnvVar("SMTP_PASS"),
} as const;