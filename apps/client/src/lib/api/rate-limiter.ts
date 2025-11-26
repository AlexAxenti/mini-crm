type TokenBucket = {
  tokens: number;
  lastRefill: number;
};

const CAPACITY = 60;
const REFILL_RATE = 1; // 1 per second
const IDLE_TTL = 5 * 60000;

const buckets: Map<string, TokenBucket> = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (now - bucket.lastRefill > IDLE_TTL) {
      buckets.delete(key);
    }
  }
}, 60000);

type RateLimitResult = {
  allowed: boolean;
  remainingTokens: number;
};

export const rateLimit = (key: string): RateLimitResult => {
  const now = Date.now();

  let bucket = buckets.get(key);

  if (!bucket) {
    bucket = { tokens: CAPACITY - 1, lastRefill: now };
    buckets.set(key, bucket);
    return { allowed: true, remainingTokens: bucket.tokens };
  }

  const elapsed = now - bucket.lastRefill;
  const tokensToAdd = Math.floor(elapsed / (1000 / REFILL_RATE));

  if (tokensToAdd > 0) {
    bucket.tokens = Math.min(CAPACITY, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;
  }

  if (bucket.tokens <= 0) {
    return { allowed: false, remainingTokens: 0 };
  }

  bucket.tokens -= 1;
  buckets.set(key, bucket);

  return { allowed: true, remainingTokens: bucket.tokens };
};
