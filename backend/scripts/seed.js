import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MenuItem } from '../src/models/MenuItem.js';

dotenv.config();

async function run() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/coffee_shop_db';
  try {
    await mongoose.connect(uri);

    const sampleItems = [
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
    ];

    const mode = process.env.SEED_MODE || 'append'; // 'append' | 'replace'

    if (mode === 'replace') {
      await MenuItem.deleteMany({});
      await MenuItem.insertMany(sampleItems);
      console.log('Seed (replace) completed: inserted %d items', sampleItems.length);
    } else {
      const ops = sampleItems.map((doc) => ({
        updateOne: {
          filter: { name: doc.name, category: doc.category },
          update: { $setOnInsert: doc },
          upsert: true,
        },
      }));
      const res = await MenuItem.bulkWrite(ops, { ordered: false });
      const inserted = res.upsertedCount || 0;
      console.log('Seed (append) completed: upserted %d new items (existing kept)', inserted);
    }
  } catch (err) {
    console.error('Seeding failed:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

run();


