import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from './db.js';
import Product from './Product.model.js';
import axios from 'axios';
import cors from 'cors';


dotenv.config();

const app = express();
app.use(express.json());

// ✅ Allow CORS from any origin (for development)
app.use(cors());

// OR if you want to allow only your frontend:
app.use(cors({
    origin: 'http://127.0.0.1:5500'
}));

// Create a product
app.post('/products', async (req, res) => {
    const product = req.body;

    if (!product.name || !product.link || !product.price || !product.image) {
        return res.status(400).json({ success: false, message: "Please provide all fields" });
    }

    const newProduct = new Product(product);
    try {
        await newProduct.save();
        res.status(201).json({ success: true, data: newProduct });
    } catch (error) {
        console.error("Error in create product:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Delete a product
app.delete('/products/:id', async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Invalid product ID" });
    }

    try {
        await Product.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Product deleted" });
    } catch (error) {
        res.status(404).json({ success: false, message: "Product not found" });
    }
});

// Update a product
app.put('/products/:id', async (req, res) => {
    const { id } = req.params;
    const product = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Invalid product ID" });
    }

    try {
        const updatedProduct = await Product.findByIdAndUpdate(id, product, { new: true });
        res.status(200).json({ success: true, data: updatedProduct });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Get all products
app.get('/products', async (req, res) => {
    try {
        const products = await Product.find({});
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        console.log('Error in fetching products:', error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Delete all products
app.delete('/products', async (req, res) => {
    try {
        await Product.deleteMany({});
        res.status(200).json({ success: true, message: "All products deleted" });
    } catch (error) {
        console.error("Error deleting all products:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

app.get('/getItems', async (req, res) => {
    try {
        const response = await axios.get('https://api.sandbox.ebay.com/buy/browse/v1/item_summary/search?q=phone&limit=5&offset=0', {
            headers: {
                'Authorization': `Bearer ${process.env.EBAY_TOKEN}`,
                'Content-Type': 'application/json',
                'X-EBAY-C-ENDUSERCTX': 'contextualLocation=country=IL', // Optional
            }
        });
        res.status(200).json({ success: true, data: response.data });
    } catch (error) {
        console.error('Error fetching products from eBay:', error);
        res.status(500).json({ success: false, message: 'Error fetching products from eBay', error: error.message });
    }
});

const VERIFICATION_TOKEN = process.env.VERIFICATION_TOKEN; // your 32–80 char token

app.use(express.json());

app.post('/marketplace-account-deletion', (req, res) => {
  const token = req.headers['verification-token'];

  if (token === VERIFICATION_TOKEN) {
    console.log('✅ Account deletion verified:', req.body);
    res.status(200).send('OK');
  } else {
    console.warn('❌ Invalid verification token');
    res.status(403).send('Forbidden');
  }
});

// Connect to DB and start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    connectDB(process.env.MONGO_URI); // Ensure MongoDB URI is in .env
    console.log(`Server running on port ${PORT}`);
});
