import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  products: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, default: 1 }
  }],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active'
  }
}, { timestamps: true });

export const Cart = mongoose.model('Cart', cartSchema);
