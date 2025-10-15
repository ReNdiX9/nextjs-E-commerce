import { MongoClient, ServerApiVersion } from "mongodb";

if (!process.env.MONGODB_URI) throw new Error("Mongo URI not found");

const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
//connect to mongodb
async function getDB(dbName) {
  try {
    await client.connect();
    console.log("Connected to DB");
    return client.db(dbName);
  } catch (e) {
    console.error(e);
  }
}
//function to get collection
export async function getCollection(collectionName) {
  try {
    const db = await getDB("shopease");
    if (db) return db.collection(collectionName);

    return null;
  } catch (e) {
    console.error(e);
  }
}
