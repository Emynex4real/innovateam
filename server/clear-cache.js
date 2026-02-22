require('dotenv').config();
const { getRedis, isRedisReady } = require('./utils/redisClient');

async function clearCache() {
  console.log('🧹 Clearing corrupted cache...\n');
  
  if (!isRedisReady()) {
    console.log('❌ Redis not connected');
    process.exit(1);
  }
  
  const redis = getRedis();
  
  try {
    // Clear all api cache keys
    const keys = await redis.keys('api:*');
    console.log(`Found ${keys.length} cache keys`);
    
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`✅ Cleared ${keys.length} corrupted cache keys`);
    } else {
      console.log('✅ No cache keys to clear');
    }
    
    console.log('\n🎉 Cache cleared! Refresh your browser.');
    
  } catch (error) {
    console.error('❌ Failed:', error.message);
    process.exit(1);
  }
  
  process.exit(0);
}

clearCache();
