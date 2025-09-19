import Venta from '../models/venta.js';
import Producto from '../models/producto.js';
import Cliente from '../models/cliente.js';
import { SaleValidators } from '../helpers/sale.js';

// 1. Registrar Venta
export const registerSale = async (req, res) => {
    try {
        const { document, products, metodoPago } = req.body;

        // 1. Validar cliente y método de pago
        const cliente = await SaleValidators.validateDocument(document);
        SaleValidators.validatePaymentMethod(metodoPago);

        // 2. Procesar productos
        const productosVenta = [];
        let total = 0;

        for (const item of products) {
            SaleValidators.validateQuantity(item.cantidad);
            const producto = await SaleValidators.validateBarcode(item.barcode);

            const subtotal = producto.price * item.cantidad;
            total += subtotal;

            productosVenta.push({
                product: producto._id,
                cantidad: item.cantidad,
                precioUnitario: producto.price
            });
        }

        // 3. Crear y guardar venta
        const nuevaVenta = new Venta({
            cliente: cliente._id,
            products: productosVenta,
            total: Number(total.toFixed(2)),
            metodoPago
        });

        // 4. Actualizar stock
        await Promise.all(
            products.map(item =>
                Producto.findOneAndUpdate(
                    { barcode: Number(item.barcode) },
                    { $inc: { stock: -item.cantidad, SalesTotal: item.cantidad } }
                )
            )
        );

        await nuevaVenta.save();
        
        // Registrar en el historial del cliente
        await Cliente.findByIdAndUpdate(
            cliente._id,
            { $push: { purchaseHistory: nuevaVenta._id } }
        );

        // 5. Respuesta con TODA la información
        const ventaCompleta = await Venta.findById(nuevaVenta._id)
            .populate('cliente')
            .populate('products.product');

        res.status(201).json({
            success: true,
            msg: "Venta registrada exitosamente",
            data: ventaCompleta
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// 2. Listar Todas las Ventas
export const listSales = async (req, res) => {
    try {
        const ventas = await Venta.find()
            .populate('cliente') // Todos los campos del cliente
            .populate('products.product'); // Todos los campos del producto

        // Calcular el TOTAL GENERAL de todas las ventas
        const totalGeneral = ventas.reduce((sum, venta) => sum + venta.total, 0);

        res.status(200).json({ 
            success: true,
            msg: "Lista de ventas obtenida exitosamente", 
            data: ventas, // ← TODA la información sin procesar
            totalVentas: totalGeneral,
            cantidadVentas: ventas.length
        });

    } catch (error) {
        res.status(500).json({ 
            success: false,
            msg: "Error interno del servidor" 
        });
    }
};

// 3. Obtener Venta Específica
export const getSale = async (req, res) => {
    try {
        const venta = await Venta.findById(req.params.id)
            .populate('cliente')
            .populate('products.product');

        if (!venta) {
            return res.status(404).json({
                success: false,
                message: `Venta con ID ${req.params.id} no encontrada`
            });
        }

        res.json({
            success: true,
            msg: "Venta encontrada",
            data: venta // ← TODA la información
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener la venta'
        });
    }
};

// 4. Ventas por Cliente
export const getSalesByClient = async (req, res) => {
    try {
        const { document } = req.params;

        // Buscar cliente
        const cliente = await Cliente.findOne({ document: Number(document) });
        if (!cliente) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            });
        }

        // Buscar ventas del cliente
        const ventas = await Venta.find({ cliente: cliente._id })
            .populate('cliente')
            .populate('products.product');

        res.json({
            success: true,
            msg: "Ventas del cliente",
            cliente: cliente,
            data: ventas, // ← TODAS las ventas con toda la información
            totalVentasCliente: ventas.length
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 5. Ventas por Producto
export const getSalesByProduct = async (req, res) => {
    try {
        const { barcode } = req.params;
        const { desde, hasta } = req.query;

        const filtro = { 
            'products.product': await Producto.findOne({ barcode: Number(barcode) })
        };

        if (desde || hasta) {
            filtro.createdAt = {};
            if (desde) filtro.createdAt.$gte = new Date(desde);
            if (hasta) filtro.createdAt.$lte = new Date(hasta);
        }

        const ventas = await Venta.find(filtro)
            .populate('cliente')
            .populate('products.product');

        const producto = await Producto.findOne({ barcode: Number(barcode) });

        res.json({ 
            success: true, 
            msg: "Ventas del producto",
            producto: producto,
            data: ventas // ← TODAS las ventas con toda la información
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// 6. Eliminar Venta (si es necesario)
export const deleteSale = async (req, res) => {
    try {
        const venta = await Venta.findByIdAndDelete(req.params.id);
        
        if (!venta) {
            return res.status(404).json({
                success: false,
                message: 'Venta no encontrada'
            });
        }

        res.json({
            success: true,
            msg: "Venta eliminada exitosamente",
            data: venta
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};