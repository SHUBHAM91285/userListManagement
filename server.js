const express = require('express');
const app = express();
const db = require('./db');
require('dotenv').config();

const bodyParser = require('body-parser');
app.use(bodyParser.json()); // it stores the data in req.body, the data which is sent by Postman

const PORT = process.env.PORT || 3000;

const adminRoutes = require('./routes/adminRoutes'); 
const userRoutes = require('./routes/userRoutes'); 

app.use('/admin', adminRoutes);
app.use('', userRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});
