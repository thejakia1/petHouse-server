const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const port = process.env.PORT || 5000;

// Updated CORS configuration for deployment
app.use(cors());
app.use(express.json());

// MongoDB connection string (unchanged but using environment variable)
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qmx8p.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        console.log("database connected!");
        const database = client.db('petHouse');
        const productsCollection = database.collection('products');
        const bookingCollection = database.collection('booking');
        const usersCollection = database.collection('users');
        const reviewsCollection = database.collection('reviews');

        //get products api
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            console.log(products, 'products api response');
            res.send({ products });
        });

        //get 6 products api
        app.get('/fixedProducts', async (req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.limit(6).toArray();
            res.send({ products });
        });


        //get single product
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.findOne(query);
            res.json(result);
        });

        //add single product
        app.post("/products", async (req, res) => {
            console.log(req.body);
            const result = await productsCollection.insertOne(req.body);
            res.json(result);
        });

        //delete single booking
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            res.json(result);
        });

        //get reviews api
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({});
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        //add single reviews
        app.post("/reviews", async (req, res) => {
            console.log(req.body);
            const result = await reviewsCollection.insertOne(req.body);
            res.json(result);
        });

        //get booking based on email
        app.get("/booking/:email", async (req, res) => {
            const result = await bookingCollection.find({
                email: req.params.email,
            }).toArray();
            res.send(result);
        });

        app.get("/booking", async (req, res) => {
            const cursor = bookingCollection.find({});
            const booking = await cursor.toArray();
            res.send(booking);
        });


        //add an booking
        app.post('/booking', async (req, res) => {
            const booking = req.body;
            const result = await bookingCollection.insertOne(booking);
            res.json(result)
        });


        //get all booking
        app.get("/allBookingProduct", async (req, res) => {
            const result = await bookingCollection.find({}).toArray();
            console.log(result);
            res.send(result);
        });


        //delete single booking
        app.delete('/booking/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await bookingCollection.deleteOne(query);
            res.json(result);
        });


        //update status
        app.put("/booking/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const option = { upsert: true };
            const updateDoc = {
                $set: {
                    status: "Shipped"
                }
            }
            const result = await bookingCollection.updateOne(query, updateDoc, option)
            res.send(result);
        });


        // find-out admin
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        });


        //add new user
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });


        //update or insert new user/user
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });


        //verify admin
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result)

        });
    }
    finally {
        //await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Welcome to petHouse Database!!');
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening at http://localhost:${port}`);
});