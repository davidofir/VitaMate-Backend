const { MongoClient, Collection } = require('mongodb');
const url = process.env.MONGO_CONNECTION_STRING;
const client = new MongoClient(url);
let db, collection;

async function initDb() {
    await client.connect();
    db = client.db();
    collection = db.collection('drug');
}
initDb().catch(console.error);


async function getDrugByName(drugName){
    return await collection.findOne({
        _id: drugName.toUpperCase()
    })
}
async function createDrug(name,purpose,warnings,doNotUse,usage,dosage,askDoctor,questions){
    const drugExist = await getDrugByName(name);
    if(!drugExist){
        try{
            await collection.insertOne(
                {
                    _id:name,
                    'purpose': purpose,
                    'warnings':warnings,
                    'do not use': doNotUse,
                    'usage':usage,
                    'dosage':dosage,
                    'ask doctor':askDoctor,
                    'questions':questions
                }
            );
            return true;
        }
        catch(e){
            console.error('Error inserting drug',e);
            return false;
        }
    }
    return false;
}

async function deleteDrug(drugName){
    try {
        const response = await collection.deleteMany({ _id: drugName });
        if (response.deletedCount === 0) {
            return false;
        }
        return true;
    } catch (e) {
        return false;
    }
    
}
module.exports = {getDrugByName, createDrug, deleteDrug};