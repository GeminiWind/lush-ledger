import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import { executeMonthEndAutoTransferForUser } from "@/lib/savings-auto-transfer";

type AutoTransferQueuePayload = {
  userId: string;
  monthStartISO: string;
  timezone: string;
};

const QUEUE_NAME = "savings-auto-transfer-month-end";
let queueSingleton: Queue<AutoTransferQueuePayload> | null = null;
let workerSingleton: Worker<AutoTransferQueuePayload> | null = null;
let redisSingleton: IORedis | null = null;

const resolveRedisUrl = () => {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  }

  const host = process.env.REDIS_HOST;
  if (!host) {
    return null;
  }

  const port = process.env.REDIS_PORT || "6379";
  const password = process.env.REDIS_PASSWORD;

  if (password) {
    return `redis://:${encodeURIComponent(password)}@${host}:${port}`;
  }

  return `redis://${host}:${port}`;
};

const getRedisConnection = () => {
  const redisUrl = resolveRedisUrl();
  if (!redisUrl) {
    return null;
  }

  if (!redisSingleton) {
    redisSingleton = new IORedis(redisUrl, {
      maxRetriesPerRequest: null,
      lazyConnect: true,
    });
    redisSingleton.on("error", (error) => {
      console.error("[auto-transfer][redis] connection error", error);
    });
  }

  return redisSingleton;
};

export const getAutoTransferQueue = () => {
  const connection = getRedisConnection();
  if (!connection) {
    return null;
  }

  if (!queueSingleton) {
    queueSingleton = new Queue<AutoTransferQueuePayload>(QUEUE_NAME, {
      connection,
    });
  }

  return queueSingleton;
};

export const enqueueAutoTransferJob = async (payload: AutoTransferQueuePayload) => {
  const queue = getAutoTransferQueue();
  if (!queue) {
    return null;
  }

  const jobId = `${payload.userId}-${payload.monthStartISO}`;

  return queue.add("month-end-auto-transfer", payload, {
    jobId,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: 100,
  });
};

export const startAutoTransferWorker = () => {
  const connection = getRedisConnection();
  if (!connection) {
    console.info(
      "[auto-transfer][queue] Redis is not configured (REDIS_URL or REDIS_HOST/REDIS_PORT); worker is disabled",
    );
    return null;
  }

  if (workerSingleton) {
    return workerSingleton;
  }

  workerSingleton = new Worker<AutoTransferQueuePayload>(
    QUEUE_NAME,
    async (job) => {
      const { userId, monthStartISO, timezone } = job.data;
      return executeMonthEndAutoTransferForUser({ userId, monthStartISO, timezone });
    },
    {
      connection,
      concurrency: 4,
    },
  );

  workerSingleton.on("completed", (job) => {
    console.info("[auto-transfer][queue] worker completed", {
      jobId: job.id,
    });
  });

  workerSingleton.on("failed", (job, error) => {
    console.error("[auto-transfer][queue] worker failed", {
      jobId: job?.id,
      error: error.message,
    });
  });

  return workerSingleton;
};
