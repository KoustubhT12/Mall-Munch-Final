import {createClient} from 'redis';







const redisConfig = {
  url: process.env.REDIS_URL,
  socket: {
    connectTimeout: 5000,
    reconnectStrategy: (retries) => Math.min(retries * 100, 5000)
  }
};


const redisClient = createClient(redisConfig);


redisClient.on('error', (err) => {
  console.error('Redis error:', err.message);

});



// Connect to Redis
(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error('Redis connection failed:', err);
  }
})();



process.on('SIGINT', async () => {
  await redisClient.quit();
  process.exit(0);
});

export default redisClient;