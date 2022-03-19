const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const schema = require('./schema/schema');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

//allow cross origin requests
app.use(cors());

mongoose.connect('mongodb+srv://junaid:123abc@cluster0.hcsm1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority');
mongoose.connection.once('open', ()=>{
    console.log('connected to database');
});

// var bodyParser = require('body-parser');
// app.use(express.static('frontend'));
// app.use(bodyParser.json());

app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true
}));



const http = require('http');
const PORT = 4000;

http.createServer(app).listen(PORT, function (err) {
    if (err) console.log(err);
    else console.log("HTTP server on http://localhost:%s", PORT);
});