import NodeCG from "nodecg/types";
import Redis from "ioredis";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

export default (nodecg: NodeCG.ServerAPI) => {
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

      // Try fetching stream length as test
      if (process.env.REDIS_STREAM) {
        const len = await redis.xlen(process.env.REDIS_STREAM);
        nodecg.log.info(
          `ℹ️ Stream "${process.env.REDIS_STREAM}" length: ${len}`
        );
      }

      // Close after test
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

  // Run both on startup
  testRedis();
  testMySQL();
};
