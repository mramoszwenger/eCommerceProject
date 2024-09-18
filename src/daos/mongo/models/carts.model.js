import {Schema, model} from 'mongoose';

const cartSchema = new Schema({
    products: [{
        product: {
            type: Schema.Types.ObjectId,
            ref: 'products',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: [1, 'La cantidad debe ser al menos 1'],
            default: 1
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    versionKey: false
});

// Middleware para popular los productos automáticamente
cartSchema.pre('find', function(next) {
    this.populate('products.product');
    next();
});

cartSchema.pre('findOne', function(next) {
    this.populate('products.product');
    next();
});

// Método para calcular el total del carrito
cartSchema.methods.calculateTotal = function() {
    return this.products.reduce((total, item) => {
        return total + (item.product.price * item.quantity);
    }, 0);
};

// Índice para mejorar el rendimiento de las búsquedas
cartSchema.index({ 'products.product': 1 });

export const cartsModel = model('carts', cartSchema);