const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

// middleware
// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@ph-8.7tjeuwe.mongodb.net/?retryWrites=true&w=majority`;

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
    await client.connect();

    // database and collection name
    const database = client.db("pickDB");
    const taskCollection = database.collection("taskCollection");
    const myTaskCartCollection = database.collection("myTaskCartCollection");

    // task all api

    // get api
    app.get("/api/v1/tasks", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { authorEmail: req.query?.email };
      }
      const cursor = taskCollection.find(query);
      const result = await cursor.toArray();
      res.send({ result });
    });
    // single task
    app.get("/api/v1/single-task/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await taskCollection.findOne(query);
      res.send({ result });
    });

    // post api
    app.post("/api/v1/add-task", async (req, res) => {
      const task = req.body;
      const result = await taskCollection.insertOne(task);
      res.send({ result });
    });

    // put api
    app.put("/api/v1/update-task/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const task = req.body;

      const updateDoc = {
        $set: {
          title: task.title,
          description: task.description,
          dueDate: task.dueDate,
          priority: task.postTags,
        },
      };
      const result = await taskCollection.updateOne(filter, updateDoc, options);
      res.send({ result });
    });

    // delete api
    app.delete("/api/v1/delete-task/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await taskCollection.deleteOne(query);
      res.send({ result });
    });

    // My task cart Collection

    // get api
    app.get("/api/v1/mytask-cart", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query?.email };
      }
      const cursor = myTaskCartCollection.find(query);
      const result = await cursor.toArray();
      res.send({ result });
    });

    // post api
    app.post("/api/v1/mytask-cart", async (req, res) => {
      const myTaskCart = req.body;
      console.log(myTaskCart);
      const result = await myTaskCartCollection.insertOne(myTaskCart);
      res.send({ result });
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
  res.send("Pick Task Management Server is running");
});

app.listen(port, () => {
  console.log(`Pick Task Management Server is running on port ${port}`);
});
