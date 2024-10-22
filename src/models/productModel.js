import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String },
  thumbnail: { type: String },
  code: { type: String, required: true, unique: true },
  stock: { type: Number, required: true },
  category: { type: String, required: true },
  status: { type: Boolean, default: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Este campo puede ser el creador
}, { timestamps: true });

// Middleware para establecer el creador por defecto
productSchema.pre('save', function(next) {
  if (!this.user) {
    // Si no se proporciona un creador, se establece a un usuario admin
    this.user = 'admin';
  }
  next();
});

export const Product = mongoose.model('Product', productSchema);
