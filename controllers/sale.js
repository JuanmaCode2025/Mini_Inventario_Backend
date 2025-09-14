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
        const productosComprados = []; // Para la respuesta

        for (const item of products) {
            SaleValidators.validateQuantity(item.cantidad);
            const producto = await SaleValidators.validateBarcode(item.barcode);

            const subtotal = producto.price * item.cantidad;
            total += subtotal;

            // Para la venta
            productosVenta.push({
                product: producto._id,
                cantidad: item.cantidad,
                precioUnitario: producto.price,
                barcode: producto.barcode,
                nombre: producto.name
            });

            // Para la respuesta
            productosComprados.push({
                barcode: producto.barcode,
                name: producto.name,
                cantidad: item.cantidad,
                precioUnitario: producto.price,
                subtotal
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
        // registro al cliente
        await Cliente.findByIdAndUpdate(
            cliente._id,
            { $push: { purchaseHistory: nuevaVenta._id } }
        );

        // 5. Formatear respuesta
        res.status(201).json({
            success: true,
            data: {
                ventaId: nuevaVenta._id,
                cliente: {
                    document: cliente.document,
                    name: cliente.name
                },
                productos: productosComprados,
                total,
                metodoPago,
                fecha: nuevaVenta.createdAt
            }
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// 2. Listar Ventas
export const listSales = async (req, res) => {
    try {
        const ventas = await Venta.find()
            .sort({ createdAt: -1 })
            .populate({
                path: 'cliente',
                select: 'document name -_id' // Solo documento y nombre, excluyendo _id
            })
            .populate({
                path: 'products.product',
                select: 'barcode name -_id' // Solo barcode y nombre del producto
            });

        // Formatear la respuesta
        const ventasFormateadas = ventas.map(venta => ({
            id: venta._id,
            fecha: venta.createdAt,
            cliente: {
                document: venta.cliente.document,
                name: venta.cliente.name
            },
            productos: venta.products.map(item => ({
                barcode: item.product.barcode,
                name: item.product.name,
                cantidad: item.cantidad,
                precioUnitario: item.precioUnitario,
                subtotal: item.cantidad * item.precioUnitario
            })),
            total: venta.total,
            metodoPago: venta.metodoPago
        }));

        res.json({
            success: true,
            count: ventas.length,
            data: ventasFormateadas
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al listar ventas',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
// 3. Obtener Venta Específica
export const getSale = async (req, res) => {
    try {
        const venta = await Venta.findById(req.params.id)
            .populate('cliente', 'document nombre');

        if (!venta) {
            return res.status(404).json({
                success: false,
                message: `Venta con ID ${req.params.id} no encontrada`
            });
        }

        res.json({
            success: true,
            data: venta,
            clienteDocumento: venta.cliente.document,
            clienteNombre: venta.cliente.nombre
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
        // 1. Validar y obtener el cliente
        const cliente = await SaleValidators.validateDocument(req.params.document);

        // 2. Buscar las ventas del cliente
        const ventas = await Venta.find({ cliente: cliente._id })
            .select('-__v -createdAt -updatedAt') // Excluir campos innecesarios
            .populate({
                path: 'products.product',
                select: 'nombre precio -_id' // Solo nombre y precio del producto
            })
            .lean(); // Convertir a objeto plano

        // 3. Formatear la respuesta
        const response = {
            success: true,
            cliente: {
                document: cliente.document,
                nombre: cliente.nombre
            },
            totalVentas: ventas.length,
            ventas: ventas.map(venta => ({
                id: venta._id,
                fecha: venta.fecha,
                total: venta.total,
                metodoPago: venta.metodoPago,
                productos: venta.products.map(producto => ({
                    nombre: producto.product.nombre,
                    cantidad: producto.cantidad,
                    precioUnitario: producto.precioUnitario,
                    subtotal: producto.cantidad * producto.precioUnitario
                }))
            }))
        };

        res.json(response);

    } catch (error) {
        const statusCode = error.message.includes('no encontrado') ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

// 5. Ventas por Producto
export const getSalesByProduct = async (req, res) => {
    try {
        const { barcode, desde, hasta } = req.body;
        const filtro = { 'products.barcode': barcode };

        if (desde || hasta) {
            filtro.fecha = {};
            if (desde) filtro.fecha.$gte = new Date(desde);
            if (hasta) filtro.fecha.$lte = new Date(hasta);
        }

        const ventas = await Venta.find(filtro);
        res.json({ success: true, data: ventas });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

