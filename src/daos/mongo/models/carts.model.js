import {Schema, model} from 'mongoose';

const cartSchema = new Schema({

    products: {
        type: [{
            product: {
                type: Schema.Types.ObjectId,
                ref: 'productModel'
            },
            quantity: {
                type: Number,
                default: 1
            }
        }]
    }

})

cartSchema.pre('find', function() {
    this.populate('products.product')
})

export const cartsModel = model('cart', cartSchema)