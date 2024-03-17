const express = require('express');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({path:'/backend/node-api-layer/.env'});
const app = express();
const cors = require('cors');

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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});