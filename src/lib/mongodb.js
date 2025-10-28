import { MongoClient, ServerApiVersion } from "mongodb";

console.log("MONGODB_URI from env:", process.env.MONGODB_URI ? "Found" : "Not found");

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not defined");
}

const uri = process.env.MONGODB_URI;
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

let client;
let clientPromise;

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

//connect to mongodb
async function getDB(dbName) {
  try {
    const client = await clientPromise;
    console.log("Connected to MongoDB");
    return client.db(dbName);
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}

//function to get collection
export async function getCollection(collectionName) {
  try {
    const db = await getDB("shopease");
    if (!db) {
      throw new Error("Database connection failed");
    }
    return db.collection(collectionName);
  } catch (error) {
    console.error("Error getting collection:", error);
    throw error;
  }
}
