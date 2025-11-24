const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
require('dotenv').config()
const cors = require('cors');
const app = express()
const port = process.env.PORT || 3100

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wfr9cox.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// middleware 
app.use(cors())
app.use(express.json())


async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const db = client.db("haat-bazar")
        const productsCollection = db.collection("product")

        app.get('/products', async (req, res) => {
            const { short: shortValu, limit: limitValue } = req.query
            const short = {}
            let limit = 0
            if (shortValu === "true") {
                short.rating = -1
            }
            if (limitValue) {
                limit = parseInt(limitValue)
            }
            console.log(limit)
            const result = await productsCollection.find().sort(short).limit(limit).toArray()
            res.send(result)
        })

        app.get('/product/:id', async (req, res) => {
            const { id } = req.params
            const query = { _id: new ObjectId(id) }
            const result = await productsCollection.findOne(query)
            res.send(result)
        })
        app.post('/add-product', async (req, res) => {
            const newProduct = req.body
            function getRandomReviewScore() {
                const min = 3.0;
                const max = 5.0;
                const randomFloat = Math.random() * (max - min) + min;
                const roundedScore = Math.round(randomFloat * 10) / 10;
                return Math.min(max, roundedScore);
            }
            const rating = getRandomReviewScore();
            const arrival_days = Math.floor(Math.random() * 10) + 1;
            newProduct.rating = rating
            newProduct.arrival_days = arrival_days
            const result = await productsCollection.insertOne(newProduct)
            res.send(result)
        })
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})