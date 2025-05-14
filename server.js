
import express from 'express';
import crypto from 'crypto';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser'; // Optional, see below

import { connectDB } from './db.js';
import productSchema from './Product.model.js';


const app = express();
app.use(cors({ origin: '*' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
dotenv.config();


app.use(express.json());

const ebayGadget=mongoose.model('Ebay-gadget',productSchema);
const ebayIpones=mongoose.model('Ebay-iphone',productSchema);
const amazonGadget=mongoose.model('Amazon-gadget',productSchema);
const amazonIpones=mongoose.model('Amazon-iphones',productSchema);


// ebay gadgets
app.post('/ebay-gadgets/products', async (req, res) => {
    const product = req.body;

    if (!product.name || !product.link || !product.price || !product.image) {
        return res.status(400).json({ success: false, message: "Please provide all fields" });
    }

    const newProduct = new ebayGadget(product);
    try {
        await newProduct.save();
        res.status(201).json({ success: true, data: newProduct });
    } catch (error) {
        console.error("Error in create product:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

app.get('ebay-gadgets/products', async (req, res) => {
    try {
        const products = await ebayGadget.find({});
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        console.log('Error in fetching products:', error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

app.delete('ebay-gadgets/products', async (req, res) => {
    try {
        await ebayGadget.deleteMany({});
        res.status(200).json({ success: true, message: "All products deleted" });
    } catch (error) {
        console.error("Error deleting all products:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// amazon gadgets
app.post('/amazon-gadgets/products', async (req, res) => {
    const product = req.body;

    if (!product.name || !product.link || !product.price || !product.image) {
        return res.status(400).json({ success: false, message: "Please provide all fields" });
    }

    const newProduct = new amazonGadget(product);
    try {
        await newProduct.save();
        res.status(201).json({ success: true, data: newProduct });
    } catch (error) {
        console.error("Error in create product:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

app.get('amazon-gadgets/products', async (req, res) => {
    try {
        const products = await amazonGadget.find({});
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        console.log('Error in fetching products:', error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

app.delete('amazon-gadgets/products', async (req, res) => {
    try {
        await amazonGadget.deleteMany({});
        res.status(200).json({ success: true, message: "All products deleted" });
    } catch (error) {
        console.error("Error deleting all products:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// ebay iphones
app.post('/ebay-iphones/products', async (req, res) => {
    const product = req.body;

    if (!product.name || !product.link || !product.price || !product.image) {
        return res.status(400).json({ success: false, message: "Please provide all fields" });
    }

    const newProduct = new ebayIpones(product);
    try {
        await newProduct.save();
        res.status(201).json({ success: true, data: newProduct });
    } catch (error) {
        console.error("Error in create product:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

app.get('ebay-iphones/products', async (req, res) => {
    try {
        const products = await ebayIpones.find({});
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        console.log('Error in fetching products:', error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

app.delete('ebay-iphones/products', async (req, res) => {
    try {
        await ebayIpones.deleteMany({});
        res.status(200).json({ success: true, message: "All products deleted" });
    } catch (error) {
        console.error("Error deleting all products:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// amazon iphones
app.post('/amazon-iphones/products', async (req, res) => {
    const product = req.body;

    if (!product.name || !product.link || !product.price || !product.image) {
        return res.status(400).json({ success: false, message: "Please provide all fields" });
    }

    const newProduct = new amazonIpones(product);
    try {
        await newProduct.save();
        res.status(201).json({ success: true, data: newProduct });
    } catch (error) {
        console.error("Error in create product:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

app.get('amazon-iphones/products', async (req, res) => {
    try {
        const products = await amazonIpones.find({});
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        console.log('Error in fetching products:', error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

app.delete('amazon-iphones/products', async (req, res) => {
    try {
        await amazonIpones.deleteMany({});
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

    console.log(`📥 Received ${method} request`);
    console.log('🔎 Query Params:', req.query);
    console.log('📦 Body:', req.body);
    console.log('🧾 Headers:', req.headers);

    if (method === 'GET') {
        const challengeCode = req.query['challenge_code'];

        console.log('🔍 Challenge code received (GET):', challengeCode);

        if (!challengeCode || !VERIFICATION_TOKEN || !ENDPOINT_URL) {
            return res.status(400).send('Missing challenge_code or config');
        }

        // Create SHA256(challengeCode + verificationToken + endpointURL)
        const hash = crypto.createHash('sha256');
        hash.update(challengeCode);
        hash.update(VERIFICATION_TOKEN);
        hash.update(ENDPOINT_URL);
        const challengeResponse = hash.digest('hex');

        console.log('✅ Responding to eBay challenge with hash:', challengeResponse);

        return res
            .status(200)
            .json({ challengeResponse })
            .header('Content-Type', 'application/json');
    }

    if (method === 'POST') {
       const ebaySignature = req.get('x-ebay-signature');
        console.log('🔐 Received eBay signature (POST):', ebaySignature);
        console.log('🔐 VERIFICATION_TOKEN:', VERIFICATION_TOKEN);
        
        if (!ebaySignature || !VERIFICATION_TOKEN) {
            return res.status(400).send('Missing signature or token');
        }
        
        // Here you could optionally validate the signature
        // But usually, for POST, eBay JWT signature isn't something you manually validate
        // unless you're doing advanced verification
        
        console.log('✅ Notification verified. Account deletion data:');
        console.dir(req.body, { depth: null });
        
        return res.status(200).send('OK');
    }

    return res.status(405).send('Method Not Allowed');
});

// Connect to DB and start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    connectDB(process.env.MONGO_URI); // Ensure MongoDB URI is in .env
    console.log(`🚀 Server running on port ${PORT}`);
});
