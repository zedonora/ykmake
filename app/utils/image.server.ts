import sharp from "sharp";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { ENV } from "./env.server";

const s3 = new S3Client({
    region: ENV.AWS_REGION,
    credentials: {
        accessKeyId: ENV.AWS_ACCESS_KEY_ID,
        secretAccessKey: ENV.AWS_SECRET_ACCESS_KEY,
    },
    endpoint: ENV.MINIO_ENDPOINT,
    forcePathStyle: true, // MinIO에서는 path style URL 사용
    tls: false, // MinIO에서 HTTP 사용 시 필요 (기본값은 true)
});

export async function optimizeAndUploadImage(
    buffer: Buffer,
    filename: string,
): Promise<string> {
    // JPEG로 변환하고 품질 조정
    const optimized = await sharp(buffer)
        .jpeg({ quality: 80, progressive: true })
        .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
        .toBuffer();

    const key = `images/${Date.now()}-${filename}`;

    await s3.send(
        new PutObjectCommand({
            Bucket: ENV.S3_BUCKET,
            Key: key,
            Body: optimized,
            ContentType: "image/jpeg",
            CacheControl: "public, max-age=31536000",
        }),
    );

    // MinIO에서 사용하는 URL 형식 (https를 사용하지 않을 경우)
    return `${ENV.MINIO_ENDPOINT}/${ENV.S3_BUCKET}/${key}`;
}