const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 5000;


// middleware 
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ut3bs.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// verify JWT token function
const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized access' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        req.decoded = decoded;
        next();
    });
};

async function run() {
    try {
        await client.connect();
        const productCollection = client.db("ac-dc").collection("products");
        const orderCollection = client.db("ac-dc").collection("orders");
        const userCollection = client.db("ac-dc").collection("users");
        const reviewCollection = client.db("ac-dc").collection("reviews");

        // all products API
        app.get('/product', async (req, res) => {
            const query = {};
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products.reverse());
        });

        // get one product by id
        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productCollection.findOne(query);
            res.send(product);
        });

        // add product
        app.post('/product', async (req, res) => {
            const newProduct = req.body;
            const product = await productCollection.insertOne(newProduct);
            res.send(product);
        });

        // delete
        app.delete('/product/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productCollection.deleteOne(query);
            res.send(product);
        });

        // grt review
        app.get('/review', async (req, res) => {
            const query = {};
            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews.reverse());
        });

        // add review
        app.post('/review', verifyJWT, async (req, res) => {
            const newReview = req.body;
            const review = await reviewCollection.insertOne(newReview);
            res.send(review);
        });


        // get all order
        app.get('/order', verifyJWT, async (req, res) => {
            const orders = await orderCollection.find().toArray();
            res.send(orders.reverse());
        });

        // get order by user-email
        app.get('/order/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;
            const decodedEmail = req.decoded.email;
            if (email === decodedEmail) {
                const query = { email: email };
                const orders = await orderCollection.find(query).toArray();
                return res.send(orders.reverse());
            }
            else {
                return res.status(403).send({ message: 'Forbidden access' })
            }
        });

        // add order
        app.post('/order', verifyJWT, async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.send({ success: true, result });
        });

        // delete
        app.delete('/order/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const order = await orderCollection.deleteOne(query);
            res.send(order);
        });

        // get all users
        app.get('/user', verifyJWT, async (req, res) => {
            const users = await userCollection.find().toArray();
            res.send(users.reverse());
        });

        // get user by email
        app.get('/user/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            res.send(user);
        });

        app.get('/admin/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;
            const user = await userCollection.findOne({ email: email });
            const isAdmin = user.role === 'admin';
            res.send({ admin: isAdmin });
        });

        // add admin
        app.put('/user/admin/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;
            const requester = req.decoded.email;
            const requesterAccount = await userCollection.findOne({ email: requester });
            if (requesterAccount.role === 'admin') {
                const filter = { email: email };
                const updateDoc = {
                    $set: { role: 'admin' },
                };
                const result = await userCollection.updateOne(filter, updateDoc);
                res.send(result);
            }
            else {
                res.status(403).send({ message: 'Forbidden access' })
            }
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
            const result = await userCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '3000h' })
            res.send({ result, token });


        });




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






// const verifyAdmin = async (req, res, next) => {
//     const requester = req.decoded.email;
//     const requesterAccount = await userCollection.findOne({ email: requester });
//     if (requesterAccount.role === 'admin') {
//         next();
//     }
//     else {
//         res.status(403).send({ message: 'Forbidden access' });
//     }
// }