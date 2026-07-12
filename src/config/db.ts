import { MongoClient, Db } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URL = process.env.MONGODB_URL!;
const DB_NAME = process.env.DB_NAME || "aparna-sarees";

let client: MongoClient;
let db: Db;

export async function connectDB(): Promise<Db> {
  if (db) return db;

  client = new MongoClient(MONGODB_URL);
  await client.connect();
  db = client.db(DB_NAME);
  console.log(`✅ Connected to MongoDB — database: "${DB_NAME}"`);
  return db;
}

export function getDB(): Db {
  if (!db) throw new Error("DB not connected. Call connectDB() first.");
  return db;
}
