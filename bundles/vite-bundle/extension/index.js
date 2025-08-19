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
    // Replicants to share Redis stream data with client-side code
    const redisStreamLenRep = nodecg.Replicant("redisStreamLen", {
        defaultValue: 0,
    });
    const redisLatestMessagesRep = nodecg.Replicant("redisLatestMessages", { defaultValue: [] });
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
            if (process.env.REDIS_STREAM) {
                const stream = process.env.REDIS_STREAM;
                // Get total length
                const len = await redis.xlen(stream);
                redisStreamLenRep.value = len;
                nodecg.log.info(`ℹ️ Stream "${stream}" length: ${len}`);
                // Fetch messages (limit to latest 10 to avoid spam)
                const rawMessages = await redis.xrevrange(stream, "+", "-", "COUNT", 10);
                const parsedMessages = rawMessages.map(([id, fields]) => {
                    const obj = {};
                    for (let i = 0; i < fields.length; i += 2) {
                        obj[fields[i]] = fields[i + 1];
                    }
                    return { id, data: obj };
                });
                redisLatestMessagesRep.value = parsedMessages;
                if (parsedMessages.length === 0) {
                    nodecg.log.info(`⚠️ No messages found in stream "${stream}"`);
                }
                else {
                    nodecg.log.info(`📩 Showing latest ${parsedMessages.length} messages:`);
                    parsedMessages.forEach((msg) => nodecg.log.info(`📝 ID: ${msg.id}`, msg.data));
                }
            }
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
    // Run on startup
    setInterval(() => {
        testRedis();
    }, 5000);
};
