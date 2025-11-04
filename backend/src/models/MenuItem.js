import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    inStock: { type: Boolean, default: true },
  },
  { timestamps: true }
);

menuItemSchema.index({ category: 1 });

export const MenuItem = mongoose.model('MenuItem', menuItemSchema, 'menu_items');


