const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const app = express();
const cors = require('cors');
const googleAuthController = require('./routes/googleAuthController')
const serverless = require('serverless-http');
const summarize = require('./summarize');
const passport = require('passport');
const { changeDrugs,getDrugs } = require('./service');
const clientUrl = process.env.CLIENT_URL;
const corsOptions = {
    origin: clientUrl,
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(bodyParser.json({ limit: '10mb' }));
app.use(cors(corsOptions));

const session = require('express-session');

app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));
app.use(googleAuthController);
app.get('/',(req,res)=>{
    res.send('<a href="/auth/google">Authenticate with Google</a>');
})
app.post('/drugs', isLoggedIn, async (req, res) => {
    const userId = req.session.passport.user._id;
    const newDrugsList = req.body;
    console.log(req.body);

    try {
        const modifiedCount = await changeDrugs(userId, newDrugsList);

        if (modifiedCount === 0) {
            return res.status(404).send('User not found.');
        }

        res.send('Drugs list updated successfully.');
    } catch (error) {
        console.error('Failed to update drugs list:', error);
        res.status(500).send('An error occurred while updating the drugs list.');
    }
});

function isLoggedIn(req,res,next){
    console.log(req.session.passport);
    req.session.passport.user ? next() : res.sendStatus(401);
}
app.get('/protected',isLoggedIn,(req,res)=>{
    //res.send(`Hello, authenticated! ${req.session.passport.user.given_name}`)
    res.redirect('http://localhost:3000');
})
app.get('/drugs',isLoggedIn,async(req,res)=>{
    try {
        const drugs = await getDrugs(req.session.passport.user._id);
        res.send(drugs);
    } catch (error) {
        console.error('Failed to retrieve drugs list:', error);
        res.status(500).send('An error occurred while fetching the drugs list.');
    }
})


app.get('/users/auth/status', (req, res) => {
    if (req.session && req.session.passport && req.session.passport.user) {
        res.status(200).send('Authenticated');
    } else {
        res.status(401).send('Unauthorized');
    }
});
app.post('/summarize', async (req, res) => {
    const { textToSummarizeBase64 } = req.body;
    const summaryResult = await summarize(textToSummarizeBase64);

    if (summaryResult.error) {
        return res.status(summaryResult.statusCode).send({ error: summaryResult.error });
    }

    res.send({ summarizedText: summaryResult.summarizedText });
});

app.get('/test',(req,res)=>{
    res.send({
        "test":"success"
    })
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

//module.exports.handler = serverless(app);