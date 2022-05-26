const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;


// middleware 
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ut3bs.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        await client.connect();
        const productCollecton = client.db("ac-dc").collection("products");
        const orderCollecton = client.db("ac-dc").collection("orders");
        const userCollecton = client.db("ac-dc").collection("users");

        // all products API
        app.get('/product', async (req, res) => {
            const query = {};
            const cursor = productCollecton.find(query);
            const products = await cursor.toArray();
            res.send(products);
        });

        // get one product
        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productCollecton.findOne(query);
            res.send(product);
        });


        // put users
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await userCollecton.upsertOne(filter, updateDoc, options);
            res.send(result);
        })



    }
    finally {

    }
}
run().catch(console.dir);









app.get('/', (req, res) => {
    res.send('Hello from AC||DC')
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});