import mongoose from "mongoose";

const ventaSchema = new mongoose.Schema({
    cliente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cliente',
        required: true
    },
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Producto',
            required: true
        },
        cantidad: {
            type: Number,
            required: true,
            min: 1
        },
        precioUnitario: {
            type: Number,
            required: true,
            min: 0
        }
    }],
    total: {
        type: Number,
        required: true,
        min: 0
    },
    fecha: {
        type: Date,
        default: Date.now
    },
    metodoPago: {
        type: String,
        required: true,
        enum: ['efectivo', 'tarjeta', 'transferencia', 'otro']
    }
}, {
    timestamps: true
});

const Venta = mongoose.model('Venta', ventaSchema);
export default Venta;