const { MongoClient } = require("mongodb");

// const uri = "mongodb://127.0.0.1:27017";

const uri =
  "mongodb://HVK:hvk123@ac-xta4ped-shard-00-00.lhqlslw.mongodb.net:27017,ac-xta4ped-shard-00-01.lhqlslw.mongodb.net:27017,ac-xta4ped-shard-00-02.lhqlslw.mongodb.net:27017/?ssl=true&replicaSet=atlas-11fou4-shard-0&authSource=admin&appName=Cluster0";

const client = new MongoClient(uri);

let db;

async function connectDB(callback) {
  try {
    await client.connect();
    console.log("MongoDb Connected");
    db = client.db("node-app");

    callback();
  } catch (err) {
    console.log(err);
  }
}

const getDb = () => {
  if (db) {
    return db;
  } else {
    throw "No Database";
  }
};

module.exports = { connectDB, getDb };
