import express from 'express';
import multer from 'multer';
import { Client, product } from 'mindee';
import cors from 'cors';  // Import CORS module

const app = express();
app.use(cors({
    origin: 'http://localhost:5174'
}));

// Initialize Mindee client
const mindeeClient = new Client({ apiKey: "293bd60719c7abd1fae2ac2bfae60745" });

const upload = multer({ storage: multer.memoryStorage() }); // Use memory storage for file uploads

app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    try {
        // Create a document from the uploaded file buffer
        const inputSource = mindeeClient.docFromBuffer(req.file.buffer, req.file.originalname);

        // Parse the document using Mindee's API
        const apiResponse = await mindeeClient.parse(product.ReceiptV5, inputSource);
        const totalAmount = apiResponse.document.inference.prediction.totalAmount.value
        const date = apiResponse.document.inference.prediction.date.value;
        console.log(date);

        res.json({totalAmount: totalAmount, date: date});
    } catch (error) {
        console.error('Error processing document:', error);
        res.status(500).send('Error processing document');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
