import mongoose from "mongoose";

const productoSchema = new mongoose.Schema({
    barcode: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },

    details: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        default: 0
    },
    SalesTotal: {
        type: Number,
        default: 0
    },
    status: {
        type: Number,
        default: 1  //1:Activo - 0:Inactivo
    },
    
    recommendationPrice: String,
    description: String
}, {
    timestamps: true,
    versionKey: false
});

const Producto = mongoose.model('Producto', productoSchema);
export default Producto;