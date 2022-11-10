const express = require("express");
const cors = require("cors");
const jwt = require('jsonwebtoken')
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

function verifyJwt(req, res, next){
    const authHeader = req.headers.authorization

    if(!authHeader){
        return res.status(401).send({message : 'unauthorized access'})
    }
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN_SECURE, function(err, decoded){
        if(err){
           return res.status(401).send({message : 'unauthorized access'})
        }
        req.decoded = decoded;
        next();
    })

}

async function run() {
    try {
        const allServices = client.db("assignment11").collection("allServices");
        const allReviews = client.db("assignment11").collection("reviews");
        
        app.post('/jwt', (req, res) =>{
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECURE, {expiresIn : '7d'})
            res.send({token});
        })
        
        //get 3 services
        app.get("/3services", async (req, res) => {
            const query = {};
            const oldservices = await allServices.find(query).toArray();
            const services = oldservices.reverse().slice(0, 3);
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
            const options = {
                // sort matched documents in descending order by rating
                sort: { time : -1},
                
            };
            const reviews = await allReviews.find(query, options).toArray();
            res.send(reviews);
        })
        //get single service
        app.get("/services/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await allServices.findOne(query);
            res.send(service);
        });
        //get review
        app.get('/myreview', verifyJwt, async (req, res) => {
            const decoded = req.decoded;
            if(decoded.email !== req.query.email){
                res.status(403).send({message : 'Forbidden'})
            }
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
                    time : Review?.time,
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