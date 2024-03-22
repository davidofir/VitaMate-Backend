const { MongoClient, Collection } = require('mongodb');
const url = process.env.MONGO_CONNECTION_STRING;
const client = new MongoClient(url);
let db, collection;

async function initDb() {
    await client.connect();
    db = client.db();
    collection = db.collection('user');
}
async function getUserById(userId) {
    await initDb(); 
    return await collection.findOne({_id: userId});
}
async function createOrUpdate(profile) {
    await initDb(); 
    const result = await collection.findOneAndUpdate({
        _id: profile.sub
    }, {
        $set: {
            given_name: profile.given_name,
            family_name: profile.family_name
        },
        $setOnInsert: {
            drugs: []
        }
    }, {
        upsert: true
    });
    return result.value;
}

async function addDrugs(userId, newDrugs) {
    await initDb(); 
    const result = await collection.updateOne({
        _id: userId
    }, {
        $set: { drugs: newDrugs }
    });
    return result.modifiedCount;
}
async function getDrugs(userId){
    await initDb();
    db.coll
    const result = await collection.findOne({_id:userId});
    if(result) return result.drugs 
    else return [];
    
}

module.exports = { createOrUpdate, addDrugs };