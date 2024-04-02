const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const app = express();
const cors = require('cors');
const googleAuthController = require('./routes/googleAuthController');
const facebookAuthController = require('./routes/facebookAuthController')
const serverless = require('serverless-http');
const summarize = require('./summarize');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const drugController = require('./routes/drugController');
const userService = require('./services/userService');
const clientUrl = process.env.CLIENT_URL;
const corsOptions = {
    origin: clientUrl,
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(bodyParser.json({ limit: '10mb' }));
app.use(cors(corsOptions));

app.use(googleAuthController);
app.use(facebookAuthController);
app.use(drugController);
app.get('/',(req,res)=>{
    res.send('<a href="/auth/google">Authenticate with Google</a>');
})
app.post('/drugs', isLoggedIn, async (req, res) => {
    const userId = req.user._id;
    const newDrugsList = req.body;

    try {
        const modifiedCount = await userService.changeDrugs(userId, newDrugsList);

        if (modifiedCount === 0) {
            return res.status(404).send('User not found.');
        }

        res.send('Drugs list updated successfully.');
    } catch (error) {
        console.error('Failed to update drugs list:', error);
        res.status(500).send('An error occurred while updating the drugs list.');
    }
});

function isLoggedIn(req, res, next) {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) {
            console.error('JWT Authentication Error:', err);
            return res.status(401).json({ message: 'Unauthorized - Error' });
        }
        if (!user) {
            console.log('JWT Authentication Failed: No user', info);
            return res.status(401).json({ message: 'Unauthorized - No User' });
        }
        req.user = user;
        next();
    })(req, res, next);
}
app.get('/protected',isLoggedIn,(req,res)=>{
    //res.send(`Hello, authenticated! ${req.session.passport.user.given_name}`)
    res.redirect(process.env.CLIENT_URL);
})
app.get('/drugs', isLoggedIn, async (req, res) => {
    try {
        const drugs = await userService.getDrugs(req.user._id);
        res.send(drugs);
    } catch (error) {
        console.error('Failed to retrieve drugs list:', error);
        res.status(500).send('An error occurred while fetching the drugs list.');
    }
});
app.post('/drugs', isLoggedIn, async (req, res) => {
    try {
        const userId = req.user._id;
        const newDrugsList = req.body;

        const modifiedCount = await userService.changeDrugs(userId, newDrugsList);

        if (modifiedCount === 0) {
            return res.status(404).send('User not found.');
        }

        res.send('Drugs list updated successfully.');
    } catch (error) {
        console.error('Failed to update drugs list:', error);
        res.status(500).send('An error occurred while updating the drugs list.');
    }
});

app.get('/users/auth/status', (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).send('Unauthorized'); // Token is not valid or expired
            }
            res.status(200).send('Authenticated');
        });
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

module.exports.handler = serverless(app);