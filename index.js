const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

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
        const productsCollecton = client.db("ac-dc").collection("products");

        // all products API
        app.get('/product', async (req, res) => {
            const query = {};
            const cursor = productsCollecton.find(query);
            const products = await cursor.toArray();
            res.send(products);
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