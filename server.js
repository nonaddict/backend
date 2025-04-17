import express from 'express';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { connectDB } from './db.js';
import Product from './Product.model.js';
import axios from 'axios';
import cors from 'cors';
import mongoose from 'mongoose';  // Import mongoose

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: '*' }));

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

// eBay notifications
app.all('/marketplace-account-deletion', (req, res) => {
    const method = req.method;
    const VERIFICATION_TOKEN = process.env.VERIFICATION_TOKEN;
    const ENDPOINT_URL = process.env.ENDPOINT_URL;

    if (method === 'GET') {
        const challengeCode = req.query['challenge_code'];

        console.log('🔍 Challenge code received:', challengeCode);

        if (challengeCode) {
            // Hash the challenge code, verification token, and endpoint URL in the correct order
            const hash = crypto.createHash('sha256');
            hash.update(challengeCode);
            hash.update(VERIFICATION_TOKEN);
            hash.update(ENDPOINT_URL); // The endpoint URL

            const responseHash = hash.digest('hex');

            console.log('✅ Responding to eBay challenge with hash:', responseHash);
            
            // Respond with the challengeResponse
            return res.status(200)
                .json({ challengeResponse: responseHash })
                .header('Content-Type', 'application/json');
        } else {
            console.warn('❌ Missing challenge_code.');
            return res.status(400).send('Missing challenge_code');
        }
    }

    if (method === 'POST') {
        // Check if body contains challengeCode
        const challengeCode = req.body.challengeCode;  
        const expectedHash = req.get('x-ebay-signature'); // Get the hash sent by eBay

        console.log('🔐 Received eBay signature:', expectedHash);
        
        // Log challengeCode and verificationToken to debug
        console.log('🔐 Challenge Code:', challengeCode);
        console.log('🔐 Verification Token:', VERIFICATION_TOKEN);

        if (!challengeCode || !VERIFICATION_TOKEN) {
            console.error('❌ Missing challengeCode or verificationToken');
            return res.status(400).send('Missing challengeCode or verificationToken');
        }

        // Hash the challengeCode and verificationToken
        const hash = crypto.createHash('sha256');
        hash.update(challengeCode);
        hash.update(VERIFICATION_TOKEN);
        const computedHash = hash.digest('hex');

        console.log('🔐 Computed hash:', computedHash);

        // Compare the hashes
        if (computedHash === expectedHash) {
            console.log('✅ Hashes match. Account deletion notification received:');
            console.log(JSON.stringify(req.body, null, 2)); // Log the notification body
            return res.status(200).send('OK');
        } else {
            console.warn('❌ Hash mismatch. Invalid verification.');
            return res.status(403).send('Forbidden');
        }
    }

    res.status(405).send('Method Not Allowed');
});

// Connect to DB and start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    connectDB(process.env.MONGO_URI); // Ensure MongoDB URI is in .env
    console.log(`🚀 Server running on port ${PORT}`);
});
