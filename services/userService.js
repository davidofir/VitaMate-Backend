const { MongoClient } = require('mongodb');
const url = process.env.MONGO_CONNECTION_STRING;

let client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
let db = null;
let collection = null;

async function initDatabase() {
    if (!db) {
        await client.connect();
        db = client.db(); // Assuming the default DB. Specify a DB name if necessary.
        collection = db.collection('user');
    }
}

class Database {
    async getUserById(userId) {
        return await collection.findOne({ _id: userId });
    }

    async createUser(profile) {
        const userId = profile.sub ? profile.sub : profile.id;
        const result = await collection.findOneAndUpdate(
            { _id: userId },
            {
                $set: {
                    displayName: profile.displayName,
                    provider: profile.provider
                },
                $setOnInsert: {
                    drugs: []
                }
            },
            { upsert: true, returnDocument: 'after' }
        );
        return result;
    }

    async changeDrugs(userId, newDrugs) {
        const result = await collection.updateOne(
            { _id: userId },
            { $set: { drugs: newDrugs } }
        );
        return result.modifiedCount;
    }

    async getDrugs(userId) {
        const result = await collection.findOne({ _id: userId });
        return result ? result.drugs : [];
    }

    async addDrug(userId, drugName) {
        const result = await collection.findOneAndUpdate(
            { _id: userId },
            { $push: { drugs: drugName } },
            { returnDocument: 'after' }
        );
        return result.value.drugs;
    }
}

(async () => {
    await initDatabase();
})();

const databaseInstance = new Database();
module.exports = databaseInstance;
