"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../.env") });
exports.default = (nodecg) => {
    nodecg.log.info("NodeCG bundle started");
    async function testRedis() {
        try {
            const redis = new ioredis_1.default(process.env.REDIS_URL);
            redis.on("connect", () => {
                nodecg.log.info("✅ Connected to Redis successfully");
            });
            redis.on("error", (err) => {
                nodecg.log.error("❌ Redis error:", err);
            });
            // Try fetching stream length as test
            if (process.env.REDIS_STREAM) {
                const len = await redis.xlen(process.env.REDIS_STREAM);
                nodecg.log.info(`ℹ️ Stream "${process.env.REDIS_STREAM}" length: ${len}`);
            }
            // Close after test
            await redis.quit();
        }
        catch (err) {
            nodecg.log.error("Failed to connect to Redis:", err);
        }
    }
    async function testMySQL() {
        try {
            const conn = await promise_1.default.createConnection({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASS,
                database: process.env.DB_NAME,
            });
            const [rows] = await conn.query("SELECT NOW() as now");
            nodecg.log.info(`✅ Connected to MySQL. Server time: ${rows[0].now}`);
            await conn.end();
        }
        catch (err) {
            nodecg.log.error("Failed to connect to MySQL:", err);
        }
    }
    // Run both on startup
    testRedis();
    testMySQL();
};
