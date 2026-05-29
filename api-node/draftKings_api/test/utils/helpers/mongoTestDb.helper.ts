import mongoose, { type Model } from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

export const connectToInMemoryMongo = async (): Promise<MongoMemoryServer> => {
  const mongoServer = await MongoMemoryServer.create();

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  await mongoose.connect(mongoServer.getUri());
  return mongoServer;
};

export const disconnectInMemoryMongo = async (
  mongoServer: MongoMemoryServer,
): Promise<void> => {
  await mongoose.disconnect();
  await mongoServer.stop();
};

export const clearCollections = async (
  ...models: Array<Model<unknown>>
): Promise<void> => {
  await Promise.all(models.map(async (model) => model.deleteMany({})));
};
