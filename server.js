const express = require('express');
const config = require('./config/config.js');
const mongoose = require('mongoose');
const appRouter = require('./app/routes/appRoutes.js');

const cors = require('cors');

const app = express();

app.use(cors());

app.use(express.json());

appRouter.initialize(app);
mongoose
    .connect(config.dbUrl).
    then(() => {
        console.log('Connected to MongoDB', config.dbUrl);
    }).catch((err) => {
        console.error('Error connecting to MongoDB', err);
        process.exit(1);
    });

app.listen(config.serverPort, () => {
    console.log(`Server running on port ${config.serverPort}`);
});