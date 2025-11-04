import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import { MenuItem } from './src/models/MenuItem.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/coffee_shop_db';

app.use(cors());
app.use(express.json());

async function connectToMongo() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('Connected to MongoDB');
    // Auto-seed if empty
    const count = await MenuItem.countDocuments();
    if (count === 0) {
      await MenuItem.insertMany([
        // Hot Drinks
        { name: 'Espresso', category: 'Hot Drinks', price: 800.5, inStock: true },
        { name: 'Cappuccino', category: 'Hot Drinks', price: 550.5, inStock: true },
        { name: 'Latte', category: 'Hot Drinks', price: 900.0, inStock: true },
        { name: 'Americano', category: 'Hot Drinks', price: 600.0, inStock: true },
        { name: 'Mocha', category: 'Hot Drinks', price: 950.0, inStock: true },
        // Cold Drinks
        { name: 'Iced Coffee', category: 'Cold Drinks', price: 800.0, inStock: true },
        { name: 'Cold Brew', category: 'Cold Drinks', price: 850.0, inStock: true },
        { name: 'Caramel Frappé', category: 'Cold Drinks', price: 1100.0, inStock: true },
        // Pastries
        { name: 'Croissant', category: 'Pastries', price: 700.5, inStock: true },
        { name: 'Muffin', category: 'Pastries', price: 400.0, inStock: false },
        { name: 'Donut', category: 'Pastries', price: 350.0, inStock: true },
        { name: 'Cinnamon Roll', category: 'Pastries', price: 650.0, inStock: true },
        { name: 'Cheesecake Slice', category: 'Pastries', price: 950.0, inStock: true },
        { name: 'Apple Pie Slice', category: 'Pastries', price: 800.0, inStock: true },
      ]);
      console.log('Seeded sample menu items');
    } else {
      console.log(`Menu already has ${count} items`);
    }
  } catch (err) {
    console.error('MongoDB connection failed: [no response]');
    process.exit(1);
  }
}

// Routes
app.get('/menu', async (req, res) => {
  try {
    console.log('GET /menu');
    const items = await MenuItem.find({}).sort({ category: 1, name: 1 });
    console.log(`Returning ${items.length} items`);
    return res.status(200).json({ success: true, count: items.length, data: items });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch menu items' });
  }
});

app.get('/menu/random', async (req, res) => {
  try {
    console.log('GET /menu/random');
    const { exclude } = req.query;
    const match = { inStock: true };
    if (exclude) {
      try {
        match._id = { $ne: new mongoose.Types.ObjectId(exclude) };
      } catch (_) {
        // ignore invalid id
      }
    }
    const pipeline = [ { $match: match }, { $sample: { size: 1 } } ];
    const result = await MenuItem.aggregate(pipeline);
    if (!result || result.length === 0) {
      return res.status(404).json({ success: false, message: 'No in-stock items available' });
    }
    return res.status(200).json({ success: true, data: result[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch random item' });
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'Coffee Shop API' });
});

connectToMongo().then(() => {
  app.listen(PORT, () => {
    console.log(`Coffee shop server running on port ${PORT}`);
  });
});


