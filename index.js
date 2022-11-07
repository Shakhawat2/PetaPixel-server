const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require('mongodb');
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleWare
app.use(cors());
app.use(express.json());


//Connect MongoDB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.nm2ezgo.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        const allServices = client.db("assignment11").collection("allServices");
        const user = {name : "shohug", age : 25};
        const result = await allServices.insertOne(user);
        console.log(result);
    }finally{

    }
}
run().catch(err => console.log(err))

app.get("/", (req, res) =>{
    res.send("Assignment 11 server")
})

app.listen(port, () =>{
    console.log("Server is Running on ", port);
})