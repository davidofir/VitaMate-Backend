const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const cors = require('cors');
require('./auth');
const serverless = require('serverless-http');
const summarize = require('./summarize');
const { MongoClient } = require('mongodb');
const url = process.env.MONGO_CONNECTION_STRING;
const client = new MongoClient(url);

const passport = require('passport');
const session = require('express-session');

app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.get('/',(req,res)=>{
    res.send('<a href="/auth/google">Authenticate with Google</a>');
})
app.get('/auth/google',
  passport.authenticate('google', { scope:
      [ 'email', 'profile' ] }
));

app.get( '/auth/google/callback',
    passport.authenticate( 'google', {
        successRedirect: '/protected',
        failureRedirect: '/auth/google/failure'
}));
app.get('/auth/google/failure',(req,res)=>{
    res.send('Something went wrong');
})
app.get('/logout',(req,res)=>{
    req.logout((err)=>{
        return err;
    });
    res.send('Goodbye');
})
function isLoggedIn(req,res,next){
    req.user ? next() : res.sendStatus(401);
}
app.get('/protected',isLoggedIn,(req,res)=>{
    res.send(`Hello, authenticated! ${req.user.displayName}`)
})

passport.serializeUser(function(user, done) {
    done(null, user);
  });
  
  passport.deserializeUser(function(obj, done) {
    done(null, obj);
  });
const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200
};

app.use(bodyParser.json({ limit: '10mb' }));
app.use(cors(corsOptions));


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