const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

// middleWare
app.use(cors());
app.use(express.json());

app.get("/", (req, res) =>{
    res.send("Assignment 11 server")
})

app.listen(port, () =>{
    console.log("Server is Running on ", port);
})