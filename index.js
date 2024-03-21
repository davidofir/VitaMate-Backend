const express = require('express');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();
const app = express();
const cors = require('cors');
const serverless = require('serverless-http');
const { MongoClient } = require('mongodb');
const url = process.env.MONGO_CONNECTION_STRING;
const client = new MongoClient(url);
const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200
};

app.use(bodyParser.json({ limit: '10mb' }));
app.use(cors(corsOptions));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/summarize', async (req, res) => {
    const { textToSummarizeBase64 } = req.body;

    if (!textToSummarizeBase64) {
        return res.status(400).send({ error: 'No text provided' });
    }
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const prompt = `Summarize the following text: ${textToSummarizeBase64}`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const summarizedText = await response.text();
        
        res.send({ summarizedText });
    } catch (e) {
        console.error(e);
        res.status(500).send({ error: 'Error processing request' });
    }
});
app.get('/test',(req,res)=>{
    res.send({
        "test":"success"
    })
});
app.get('/users',async(req,res)=>{
    try{
        await client.connect();
        console.log('Connected successfully to server');
        const collection = client.db().collection('user');

        const users = await collection.find().toArray();
        res.send({
            users
        })

    }catch(e){
        console.log(e);
    }
})
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

//module.exports.handler = serverless(app);