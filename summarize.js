const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const summarize = async textToSummarizeBase64 => {
    if (!textToSummarizeBase64) {
        return { error: 'No text provided', statusCode: 400 };
    }
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const prompt = `Summarize the following text: ${textToSummarizeBase64}`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const summarizedText = await response.text();
        
        return { summarizedText };
    } catch (e) {
        console.error(e);
        return { error: 'Error processing request', statusCode: 500 };
    }
};

module.exports = summarize;