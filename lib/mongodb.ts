import mongoose from 'mongoose';
import dns from 'node:dns';

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error('MONGODB_URI is not configured');
const mongoUri: string = uri;

declare global { var mongooseCache: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined; }
const cache = global.mongooseCache ?? (global.mongooseCache = { conn: null, promise: null });

export async function connectDB() {
  if (cache.conn) return cache.conn;
  // Atlas uses SRV DNS records. Configure resolvers only when connecting.
  dns.setServers(['1.1.1.1', '8.8.8.8']);
  cache.promise ??= mongoose.connect(mongoUri, { bufferCommands: false });
  cache.conn = await cache.promise;
  return cache.conn;
}
