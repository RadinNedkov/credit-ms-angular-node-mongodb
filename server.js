const express = require('express');
const helmet = require("helmet")
const mongoose = require('mongoose');
require('dotenv').config();
const creditRoutes = require('#routes/credits');
const CONSTANTS = require('#config/constants')

const app = express();

const mongoString = process.env.DATABASE_URL

mongoose.connect(mongoString);
const database = mongoose.connection

database.on('error', (error) => {
    console.log(error)
})

database.once('connected', () => {
    console.log('Database Connected');
})

app.use(express.json());
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
}));
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

app.use((req, res, next) => {
    const _origin = req.headers.origin;
    if (CONSTANTS.CORS_ALLOWED.includes(_origin)) {
        res.header("Access-Control-Allow-Origin", _origin)
    }
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')
    next()
})

app.use('/api', creditRoutes)

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server Started at ${process.env.PORT}`)
})