require('dotenv').config();
require('./db');
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended :true}));


const router = require('./src/router/routes');
app.use('/', router);

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
})