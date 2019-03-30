const express = require('express');
const usersRouter = require('./routes/users');
const tweetsRouter = require('./routes/tweets');
const authRouter = require('./routes/auth');
const chatRouter = require('./routes/chat');
const mongoose = require('mongoose');
const checkLogin = require('./middlewares/checkLogin');
const app = express();

app.use(express.json());

//CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS GET POST PUT PATCH DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Bearer');
    next();
});

//Routes
app.use('/auth', authRouter);
app.use('/users', [checkLogin], usersRouter);
app.use('/tweets', [checkLogin], tweetsRouter);
app.use('/chat', [checkLogin], chatRouter);

//Home
app.get('/', (req, res) => {
    res.redirect('https://bit.ly/2Ui1Lgk');
});

const mongoUrl = process.env.mongoUrl;

//connect to mongoDB
mongoose.connect(mongoUrl, { useNewUrlParser: true }, () => {
    console.log('Connected to MongoDB');
});

const port = process.env.PORT || 5000;
app.listen(port, ()=>{
    console.log('Listening on port : ' + port);
});