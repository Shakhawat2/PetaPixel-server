const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        
        //get 3 services
        app.get("/3services", async(req, res) =>{
            const query = {};
            const services = await allServices.find(query).limit(3).toArray();
            res.send(services);
        })
        //get all services
        app.get("/services", async(req, res) =>{
            const query = {};
            const services = await allServices.find(query).toArray();
            res.send(services);
        })
        //get single service
        app.get("/services/:id", async(req, res) =>{
            const id = req.params.id;
            const query = {_id : ObjectId(id)};
            const service = await allServices.findOne(query);
            res.send(service);            
        })
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