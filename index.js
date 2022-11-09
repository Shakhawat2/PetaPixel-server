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

async function run() {
    try {
        const allServices = client.db("assignment11").collection("allServices");
        const allReviews = client.db("assignment11").collection("reviews");
        //get 3 services
        app.get("/3services", async (req, res) => {
            const query = {};
            const services = await allServices.find(query).limit(3).toArray();
            res.send(services);
        })
        //get all services
        app.get("/services", async (req, res) => {
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);
            const query = {};
            const services = await allServices.find(query).skip(page * size).limit(size).toArray();
            const count = await allServices.estimatedDocumentCount();
            res.send({ services, count });
        })
        //get Review 
        app.get("/review", async (req, res) => {
            const id = req.query.id;
            const query = { review_id: id };
            const reviews = await allReviews.find(query).toArray();
            res.send(reviews);
        })
        //get single service
        app.get("/services/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await allServices.findOne(query);
            res.send(service);
        });
        //
        app.get('/myreview', async (req, res) => {
            const currentEmail = req.query.email;
            const query = { email: currentEmail };
            const reviews = await allReviews.find(query).toArray();
            res.send(reviews);
        });
        app.get('/myreview/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await allReviews.findOne(query);
            res.send(service);
        })
        //Post service to mongodb
        app.post("/services", async (req, res) => {
            const service = req.body;
            const result = await allServices.insertOne(service);
            res.send(result);
        });
        //Post Review to MongoDb
        app.post("/review", async (req, res) => {
            const service = req.body;
            const result = await allReviews.insertOne(service);
            res.send(result);
        });
        //update review 
        app.put('/updatereview/:id', async (req, res) => {
            const id = req.params.id;
            const Review = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    description: Review?.description,
                    rating: Review?.rating,
                    email: Review?.email,
                    review_id: Review?.review_id,
                    photo: Review?.photo,
                    name: Review?.name,
                    hours: Review?.hours,
                    minutes: Review?.minutes,
                    review_time: Review?.review_time,
                    year: Review?.year,
                    month: Review?.month,
                    date: Review?.date,
                    servicename: Review?.servicename,
                },
            };
            const result = await allReviews.updateOne(filter, updateDoc, options);
            console.log(result);
            res.send(result)
        })
        // Delete Review
        app.delete("/myreview/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await allReviews.deleteOne(query);
            console.log(result);
            res.send(result)
        })

    } finally {

    }
}
run().catch(err => console.log(err))

app.get("/", (req, res) => {
    res.send("Assignment 11 server")
})

app.listen(port, () => {
    console.log("Server is Running on ", port);
})