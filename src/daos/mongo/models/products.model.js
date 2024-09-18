import { Schema, model } from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2';

const productsCollection = 'products';

const productSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    thumbnail: {
        type: String,
        required: false,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    stock: {
        type: Number,
        required: true,
        min: 0
    },
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    status: {
        type: Boolean,
        default: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { 
    timestamps: true,
    versionKey: false 
});

productSchema.plugin(mongoosePaginate);

export const productModel = model(productsCollection, productSchema);