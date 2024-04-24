/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const {Client, product} = require("mindee");

const {logger} = require("firebase-functions/logger");

// import { onRequest } from "firebase-functions/v2/https";
// import { warn, error as _error } from "firebase-functions/logger";

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const app = express();
app.use(cors({
  origin: "https://trip-tally-c943b.web.app",
  methods: ["GET", "POST"], // Allowed methods
  allowedHeaders: ["Content-Type", "Authorization"]}));

// Initialize Mindee client
const mindeeClient = new Client({apiKey: "293bd60719c7abd1fae2ac2bfae60745"});

const upload = multer({storage: multer.memoryStorage()});
// Use memory storage for file uploads

app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    logger.warn("No file uploaded.");
    return res.status(400).send("No file uploaded.");
  }

  try {
    // Create a document from the uploaded file buffer
    const i= mindeeClient.docFromBuffer(req.file.buffer, req.file.originalname);

    // Parse the document using Mindee's API
    const response = await mindeeClient.parse(product.ReceiptV5, i);
    const amount = response.document.inference.prediction.totalAmount.value;

    res.json({totalAmount: amount});
  } catch (error) {
    logger("Error processing document:", error);
    res.status(500).send("Error processing document");
  }
});

exports.api = functions.https.onRequest(app);


// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
