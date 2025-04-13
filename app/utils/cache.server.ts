import { createClient } from "redis";
import { ENV } from "./env.server";

const redis = createClient({
    url: ENV.REDIS_URL,
});

redis.on("error", (err) => console.error("Redis Client Error", err));

export async function getCache<T>(key: string): Promise<T | null> {
    const value = await redis.get(key);
    if (!value) return null;
    return JSON.parse(value);
}

export async function setCache<T>(
    key: string,
    value: T,
    expiresIn: number = 3600,
): Promise<void> {
    await redis.set(key, JSON.stringify(value), {
        EX: expiresIn,
    });
}

export async function invalidateCache(key: string): Promise<void> {
    await redis.del(key);
}