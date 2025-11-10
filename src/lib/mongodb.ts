import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  // Avoid throwing at import time in Edge; throw lazily when used
  console.warn("MONGODB_URI is not set. Set it in .env.local for local dev and in Vercel project settings.");
}

let client: MongoClient | undefined;

const globalForMongo = globalThis as unknown as { _mongoClient?: MongoClient };

export async function getMongoClient(): Promise<MongoClient> {
  if (globalForMongo._mongoClient) return globalForMongo._mongoClient;
  if (!client) {
    if (!uri) throw new Error("Missing MONGODB_URI env var");
    client = new MongoClient(uri);
    await client.connect();
  }
  globalForMongo._mongoClient = client;
  return client;
}

export async function getDb(dbName?: string): Promise<Db> {
  const c = await getMongoClient();
  return c.db(dbName);
}
