import mongoose from "mongoose";

const clienteSchema = new mongoose.Schema({
    document: {
        type: Number,
        required: true,
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    phone: {
        type: Number,
        required: true,
        trim: true
    },

    address: {
        type: String,
        required: true,
        trim: true
    },
    status:{
        type:Number,
        default: 1  // activo 1 o desactivo 0
    },

    purchaseHistory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Venta'
    }]


});

const Cliente = mongoose.model('Cliente', clienteSchema);
export default Cliente;