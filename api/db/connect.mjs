import { MongoClient, ServerApiVersion } from "mongodb";
import debugModule from "debug";

const debug = debugModule('app:server');
const uri = process.env.DB_URI || "";
const client = new MongoClient(uri);

let db;

try {
    if (!db) {
        const conn = await client.connect();
        db = conn.db("Mushpedia");
        db.command({ ping: 1 });
        debug("Pinged your deployment. You successfully connected to MongoDB!");
    }
} catch (e) {
    debug(`Error trying to connect to the database: ${e}`);
}

export default db;