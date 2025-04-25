const express = require("express");
const mongoose = require("mongoose");
// For accessing ENV variables.
require('dotenv').config();

// ENV variables
const PORT =  process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI;

// All routes.

const rootRouter = require("./routes/index");


const app = express();
app.use(express.json());

// Connect to database.
mongoose.connect(MONGODB_URI).then(()=>{
    console.log('Connected to database');
}).catch(()=>{
    console.log('Unable to connect database');
})

app.use('/api/v1', rootRouter);



app.get('/',(req, res)=>{
    res.send('Hello World');
})

app.listen(PORT, ()=>{
    console.log('Server is running on ' + PORT);
});