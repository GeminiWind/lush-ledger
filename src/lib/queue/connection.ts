import IORedis from "ioredis";

type QueueGlobals = {
  redisConnection?: IORedis;
};

const globalForQueue = globalThis as unknown as QueueGlobals;

const toNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const getQueueConnection = () => {
  if (!globalForQueue.redisConnection) {
    globalForQueue.redisConnection = new IORedis({
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: toNumber(process.env.REDIS_PORT, 6379),
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
      lazyConnect: false,
    });
  }

  return globalForQueue.redisConnection;
};
