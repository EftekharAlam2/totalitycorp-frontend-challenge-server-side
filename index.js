const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.v1phe5i.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const productsCollection = client
      .db("sampleData")
      .collection("collectionData");
    const userCollection = client.db("sampleData").collection("userData");
    const orderCollection = client.db("sampleData").collection("orderData");

    app.get("/products", async (req, res) => {
      const result = await productsCollection.find().toArray();

      res.send(result);
    });

    app.get("/products/:category/:price/:rating", async (req, res) => {
      const category = req.params.category;
      const price = parseFloat(req.params.price);
      const rating = parseFloat(req.params.rating);

      const query = {
        category: category,
        price: { $lte: price },
        rating: { $lte: rating },
      };

      try {
        const result = await productsCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    app.post("/addproduct", async (req, res) => {
      const newProduct = req.body;
      const result = await userCollection.insertOne(newProduct);
      res.send(result);
    });

    app.get("/product/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };

      const result = await userCollection.find(query).toArray();
      res.send(result);
    });

    app.delete("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });

    app.post("/order", async (req, res) => {
      const newOrder = req.body;
      const result = await orderCollection.insertOne(newOrder);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("The server is running");
});

app.listen(port, () => {
  console.log(`The Server is running on port ${port}`);
});
