import mongoose from 'mongoose';

declare global {
  var mongooseCache:
    { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
}
const cache = global.mongooseCache ?? (global.mongooseCache = { conn: null, promise: null });

/** A failed connection must not poison subsequent requests. No database access at import/build time. */
export async function connectDB() {
  if (cache.conn?.connection.readyState === 1) return cache.conn;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Database is not configured');
  try {
    cache.promise ??= mongoose.connect(uri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 15000,
      maxPoolSize: 10,
      minPoolSize: 0,
      waitQueueTimeoutMS: 5000,
      autoIndex: process.env.NODE_ENV !== 'production',
    });
    cache.conn = await cache.promise;
    return cache.conn;
  } catch (error) {
    cache.conn = null;
    throw error;
  } finally {
    cache.promise = null;
  }
}
