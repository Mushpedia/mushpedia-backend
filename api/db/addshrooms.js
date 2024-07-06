const { MongoClient, ServerApiVersion } = require("mongodb");
const data = require("../../mushroom_data/mushrooms_data_X.json");

const uri = "mongodb+srv://linussilfver:3yCzpAQyGDYF18Yd@mushrooms.zmdins0.mongodb.net/?retryWrites=true&w=majority&appName=Mushrooms"
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function createshroom(db, newMushroom) {
    try {
        const result = await db.collection("mushrooms").insertOne(newMushroom);
        console.log(`New mushroom created with the following id: ${result.insertedId}`);
    } catch (error) {
        console.log(error);
    }
}

async function createMockShrooms(db) {
    for (let index = 0; index < 100; index++) {
        const mushroom = {
            name: `Boletus_${index}`,
            eng_name: `Mushroom_${index}`,
            family: `Mushroom_family_${index}`,
            location: `Mushroom_location_${index}`,
            characteristics: `Mushroom_characteristics_${index}`,
            description: {
                general: `Mushroom_general_${index}`,
                cap: `Mushroom_cap_${index}`,
                gills: `Mushroom_gills_${index}`,
                stem: `Mushroom_stem_${index}`,
                spore_print: `Mushroom_spore_${index}`
            },
            images: [
                "https://www.mushroom.world/data/fungi/Agaricusarvensis1.jpg",
                "https://www.mushroom.world/data/fungi/Agaricusarvensis2.jpg"
            ]
        };

        await createshroom(db, mushroom);
    }
}

async function uploadShrooms(db) {
    data
    for (let index = 0; index < data.length; index++) {
        const mushroom = data[index]

        await createshroom(db, mushroom);
    }
}

async function run() {
    try {
        // Connect the client to the server (optional starting in v4.7)
        await client.connect();
        // Get the database
        const db = client.db("Mushpedia");
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
        await uploadShrooms(db);
    } catch (e) {
        console.error(e);
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}

run().catch(console.dir);
