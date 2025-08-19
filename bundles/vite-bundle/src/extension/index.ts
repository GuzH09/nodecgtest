import NodeCG from "nodecg/types";
import Redis from "ioredis";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

export default (nodecg: NodeCG.ServerAPI) => {
  // Replicants to share Redis stream data with client-side code
  const redisStreamLenRep = nodecg.Replicant<number>("redisStreamLen", {
    defaultValue: 0,
  });

  type RedisMessage = { id: string; data: Record<string, string> };
  const redisLatestMessagesRep = nodecg.Replicant<RedisMessage[]>(
    "redisLatestMessages",
    { defaultValue: [] }
  );

  nodecg.log.info("NodeCG bundle started");

  async function testRedis() {
    try {
      const redis = new Redis(process.env.REDIS_URL!);
  
      redis.on("connect", () => {
        nodecg.log.info("✅ Connected to Redis successfully");
      });
  
      redis.on("error", (err) => {
        nodecg.log.error("❌ Redis error:", err);
      });
  
      if (process.env.REDIS_STREAM) {
        const stream = process.env.REDIS_STREAM;
  
        // Get total length
        const len = await redis.xlen(stream);
        redisStreamLenRep.value = len;
        nodecg.log.info(`ℹ️ Stream "${stream}" length: ${len}`);
  
        // Fetch messages (limit to latest 10 to avoid spam)
        const rawMessages = await redis.xrevrange(
          stream,
          "+",
          "-",
          "COUNT",
          10
        );

        const parsedMessages: RedisMessage[] = rawMessages.map(([id, fields]) => {
          const obj: Record<string, string> = {};
          for (let i = 0; i < fields.length; i += 2) {
            obj[fields[i]] = fields[i + 1];
          }
          return { id, data: obj };
        });

        redisLatestMessagesRep.value = parsedMessages;

        if (parsedMessages.length === 0) {
          nodecg.log.info(`⚠️ No messages found in stream "${stream}"`);
        } else {
          nodecg.log.info(`📩 Showing latest ${parsedMessages.length} messages:`);
          parsedMessages.forEach((msg) => nodecg.log.info(`📝 ID: ${msg.id}`, msg.data));
        }
      }
  
      await redis.quit();
    } catch (err) {
      nodecg.log.error("Failed to connect to Redis:", err);
    }
  }

  async function testMySQL() {
    try {
      const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
      });

      const [rows] = await conn.query("SELECT NOW() as now");
      nodecg.log.info(
        `✅ Connected to MySQL. Server time: ${(rows as any)[0].now}`
      );

      await conn.end();
    } catch (err) {
      nodecg.log.error("Failed to connect to MySQL:", err);
    }
  }

  // Run on startup
  setInterval(() => {
    testRedis();
  }, 5000);
};
