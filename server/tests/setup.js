import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongo;

async function setupTestDB() {
  mongo = await MongoMemoryServer.create({
    instance: { ip: "127.0.0.1" }
  });
  const uri = mongo.getUri();
  process.env.MONGODB_URI = uri;
  process.env.JWT_SECRET = "testsecret";
  await mongoose.connect(uri);
}

async function teardownTestDB() {
  await mongoose.connection.close();
  if (mongo) {
    await mongo.stop();
  }
}

async function resetDB() {
  await mongoose.connection.db.dropDatabase();
}

export { setupTestDB, teardownTestDB, resetDB };
