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

  async function listenToStream(redis: Redis, stream: string) {
    let lastId = "$"; // "$" means only new messages
  
    while (true) {
      try {
        const result = await redis.xread(
          "BLOCK",
          0, // wait forever for new messages
          "STREAMS",
          stream,
          lastId
        );
  
        if (result) {
          const [streamName, messages] = result[0];
          for (const [id, fields] of messages) {
            const obj: Record<string, string> = {};
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
      } catch (err) {
        nodecg.log.error("Stream read error:", err);
        await new Promise((r) => setTimeout(r, 1000)); // backoff
      }
    }
  }


  const redis = new Redis(process.env.REDIS_URL!);
  listenToStream(redis, process.env.REDIS_STREAM!);
};
