const express = require('express');
const dotenv = require('dotenv').config();
const { errorHandler } = require('./middlewears/error');
const connectDB = require('./db');

connectDB();

// Global Variables
const port = process.env.PORT;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api', require('./routes'));

app.use(errorHandler);

app.listen(port, () => {
  console.log(`backend started at: http://localhost:${port}`)
});

