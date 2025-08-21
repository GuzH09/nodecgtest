"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
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
    async function listenToStream(redis, stream) {
        let lastId = "$"; // "$" means only new messages
        while (true) {
            try {
                const result = await redis.xread("BLOCK", 0, // wait forever for new messages
                "STREAMS", stream, lastId);
                if (result) {
                    const [streamName, messages] = result[0];
                    for (const [id, fields] of messages) {
                        const obj = {};
                        for (let i = 0; i < fields.length; i += 2) {
                            obj[fields[i]] = fields[i + 1];
                        }
                        // update replicant
                        redisLatestMessagesRep.value = [
                            { id, data: obj },
                            ...redisLatestMessagesRep.value.slice(0, 9),
                        ];
                        nodecg.log.info(`📩 New message: ${id}`, obj);
                        lastId = id;
                    }
                }
            }
            catch (err) {
                nodecg.log.error("Stream read error:", err);
                await new Promise((r) => setTimeout(r, 1000)); // backoff
            }
        }
    }
    const redis = new ioredis_1.default(process.env.REDIS_URL);
    listenToStream(redis, process.env.REDIS_STREAM);
};
