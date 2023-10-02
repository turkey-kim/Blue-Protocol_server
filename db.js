import dotenv from "dotenv";
dotenv.config();
import { MongoClient } from "mongodb";
const uri = process.env.DB;

export const client = new MongoClient(uri, {
  //   useNewUrlParser: true,
  //   useUnifiedTopology: true,
});

export async function connectToMongoDB() {
  try {
    await client.connect("BP");
    console.log("Connected to MongoDB Atlas");
    return client;
  } catch (err) {
    console.log(err);
    throw err;
  }
}
