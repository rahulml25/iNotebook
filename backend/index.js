const express = require('express');
const dotenv = require('dotenv').config();
const connectDB = require('./db');
const { errorHandler } = require('./middlewears/error');

connectDB();

// Global Variables
const port = process.env.PORT;
const app = express();

app.use(express.json());
app.use('/api', require('./routes'));

app.use(errorHandler);
app.listen(port, () =>
  console.log(`backend started at: http://localhost:${port}`)
);
