const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();

// const uri =
//   "mongodb+srv://photoshop-user:Ri11559988@cluster0.oq5xc.mongodb.net/?retryWrites=true&w=majority";
const uri =
  "mongodb+srv://mama:Ri11559988@cluster0.jmqflgp.mongodb.net/?retryWrites=true&w=majority";
// const uri = `mongodb+srv://photoshop-user:Ri11559988@cluster0.7xwek.mongodb.net/Photoshop-services?retryWrites=true&w=majority`;

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.use(fileUpload());

const port = 5000;

app.get("/", (req, res) => {
  res.send("hello from db it's working working");
});

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const salesCollection = client.db("mama").collection("connection");
  //get api
  app.get("/sale", async (req, res) => {
    const query = {};

    const cursor = await salesCollection.find(query);
    const salesData = await cursor.toArray();
    res.json(salesData);
  });
  app.get("/sale/:id", async (req, res) => {
    const productId = req.params.id;
    const query = { _id: new ObjectId(productId) };

    try {
      const salesData = await salesCollection.findOne(query);
      res.json(salesData);
    } catch (error) {
      console.error("Error fetching sales data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Post API
  app.post("/sale", async (req, res) => {
    const saledata = req.body;

    const result = await salesCollection.insertOne(saledata);
    res.json("success");
  });

  app.patch("/update/:id", async (req, res) => {
    try {
      const productId = req.params.id;

      const filter = { _id: new ObjectId(productId) };
      const options = { upsert: true };

      const { name, price, quantity, bank, deposit } = req.body;

      // Validate required fields
      console.log(req.body);

      const update = {
        $set: {
          name,
          price,
          quantity,
          bank,
          deposit,
          // Add other fields to update as needed
        },
      };

      // Perform the update operation
      const result = await salesCollection.updateOne(filter, update, options);

      // Check if the update operation was successful
      if (result.modifiedCount === 1) {
        res.json({ message: "Product updated successfully" });
      } else {
        res.status(404).json({ error: "Product not found" });
      }
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/products/:id", async (req, res) => {
    try {
      const productId = req.params.id;

      const filter = { _id: new ObjectId(productId) };

      // Delete the product from the collection
      const deletedProduct = await salesCollection.deleteOne(filter);

      // Check if a document was deleted
      if (deletedProduct.deletedCount === 0) {
        return res.status(404).json({ error: "Product not found" });
      }

      // If the product was successfully deleted, send a success response
      return res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
});

app.listen(port);
