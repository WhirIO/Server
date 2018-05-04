module.exports = {
  host: process.env.HOST,
  port: process.env.PORT,
  redis: {
    url: process.env.REDIS_URL || null,
    port: process.env.REDIS_PORT || null,
    host: process.env.REDIS_HOST || null,
    db: process.env.REDIS_DB || 0,
    password: process.env.REDIS_PASSWORD || '',
    prefix: process.env.REDIS_PREFIX || '',
    retry_strategy: (options) => {
      if (options.error && options.error.code === 'ECONNREFUSED') {
        return new Error('The server refused the connection.');
      }

      if (options.total_retry_time > 1000 * 60 * 60) {
        return new Error('Retry time exhausted.');
      }

      if (options.attempt > 5) {
        return new Error('Too many reconnection attempts.');
      }

      return Math.min(options.attempt * 100, 1000);
    }
  },
  mongo: {
    url: process.env.MONGO_URI,
    poolSize: parseInt(process.env.MONGO_POOL_SIZE, 10) || 10,
    socketOptions: { keepAlive: parseInt(process.env.MONGO_KEEP_ALIVE, 10) || 1 }
  }
};
