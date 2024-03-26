const { MongoClient, Collection } = require('mongodb');
const url = process.env.MONGO_CONNECTION_STRING;
const client = new MongoClient(url);
let db, collection;

async function initDb() {
    await client.connect();
    db = client.db();
    collection = db.collection('user');
}
initDb().catch(console.error);
async function getUserById(userId) {
    return await collection.findOne({_id: userId});
}
async function createUser(profile) {

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
    return result;
}

async function changeDrugs(userId, newDrugs) {
    const result = await collection.updateOne({
        _id: userId
    }, {
        $set: { drugs: newDrugs }
    });
    return result.modifiedCount;
}
async function getDrugs(userId){
    const result = await collection.findOne({_id: userId});
    if (result) return result.drugs;
    else return [];
}
async function addDrug(userId, drugName) {
    const result = await collection.findOneAndUpdate(
        { _id: userId },
        { $push: { drugs: drugName } }, 
        { returnDocument: 'after' } 
    );
    if (result.value) return result.value.drugs;
    else return [];
}
module.exports = { createOrUpdate: createUser, changeDrugs, getDrugs, addDrug };