// import mongoose from 'mongoose';
// import Venta from '../models/venta.js';
// import Cliente from '../models/cliente.js';
// import Producto from '../models/producto.js';

// export const registrarVenta = async (req, res) => {
//     try {
//         const { cliente, products } = req.body;
//         const 

//         let total = 0;
//         const productosVenta = [];
//         const productosConIdNumerico = [];
//         const productosBajoStock = [];

//         // Verificar todos los productos antes de procesar
//         for (const item of products) {
//             const producto = await Producto.findOne({ id: item.product });

//             if (!producto) {
//                 return res.status(404).json({ error: `Producto con ID ${item.product} no existe` });
//             }

//             if (producto.stock < item.cantidad) {
//                 return res.status(400).json({ 
//                     error: `Stock insuficiente para ${producto.nombre}`,
//                     stockDisponible: producto.stock
//                 });
//             }
//         }

//         // Procesar la venta
//         for (const item of products) {
//             const producto = await Producto.findOne({ id: item.product });

//             // Actualizar stock
//             producto.stock -= item.cantidad;
//             producto.ventasTotales += item.cantidad;
//             await producto.save();

//             // Verificar stock bajo
//             if (producto.stock <= 3) {
//                 productosBajoStock.push({
//                     id: producto.id,
//                     nombre: producto.nombre,
//                     stockActual: producto.stock,
//                     stockMinimo: producto.stockMinimo || 5
//                 });
//             }

//             productosVenta.push({
//                 product: producto._id,
//                 cantidad: item.cantidad,
//                 precioUnitario: producto.precio
//             });

//             productosConIdNumerico.push({
//                 id: producto.id,
//                 nombre: producto.nombre,
//                 cantidad: item.cantidad,
//                 precioUnitario: producto.precio,
//                 stockRestante: producto.stock
//             });

//             total += producto.precio * item.cantidad;
//         }

//         const nuevaVenta = new Venta({
//             cliente,
//             products: productosVenta,
//             total
//         });

//         await nuevaVenta.save();

//         const respuesta = {
//             success: true,
//             venta: {
//                 _id: nuevaVenta._id,
//                 cliente: {
//                     _id: clienteExistente._id,
//                     nombre: clienteExistente.nombre,
//                     email: clienteExistente.email
//                 },
//                 products: productosConIdNumerico,
//                 total,
//                 fecha: nuevaVenta.createdAt
//             }
//         };

//         if (productosBajoStock.length > 0) {
//             respuesta.advertencia = {
//                 mensaje: "Productos necesitan reabastecimiento",
//                 productos: productosBajoStock,
//                 sugerencia: `Reabastecer: ${productosBajoStock.map(p => p.nombre).join(', ')}`
//             };
//         }

//         res.status(201).json(respuesta);

//     } catch (error) {
//         console.error('Error en registrarVenta:', error);
//         res.status(500).json({ 
//             error: 'Error al registrar venta',
//             details: process.env.NODE_ENV === 'development' ? error.message : undefined
//         });
//     }
// };

// // 2. Listar Ventas
// export const listSales= async (req, res) => {
//     try {
//         const { desde, hasta } = req.query;
//         const filtro = {};

//         // Agregar filtro por rango de fechas si se especifica
//         if (desde && hasta) {
//             filtro.fecha = {
//                 $gte: new Date(desde),
//                 $lte: new Date(hasta)
//             };
//         }

//         const ventas = await Venta.find(filtro)
//             .populate('cliente', 'nombre email')
//             .populate('products.product', 'nombre precio')
//             .sort({ fecha: -1 });

//         res.json({
//             success: true,
//             cantidad: ventas.length,
//             ventas
//         });

//     } catch (error) {
//         res.status(500).json({ 
//             error: 'Error al obtener las ventas',
//             details: error.message 
//         });
//     }
// };
// // 3. Obtener Venta Específica
// export const obtenerVenta = async (req, res) => {
//     try {
//         // Obtener la venta con datos poblados
//         const venta = await Venta.findById(req.params.id)
//             .populate('cliente', 'nombre email')
//             .populate({
//                 path: 'products.product',
//                 select: 'id nombre precio' // Solo necesitamos estos campos
//             });

//         if (!venta) {
//             return res.status(404).json({ error: 'Venta no encontrada' });
//         }

//         // Formatear respuesta con solo tu ID numérico
//         const respuesta = {
//             success: true,
//             venta: {
//                 id: venta._id, // ID de la venta (puedes omitirlo si no lo necesitas)
//                 cliente: venta.cliente,
//                 productos: venta.products.map(item => ({
//                     idProducto: item.product.id, // Solo tu ID numérico aquí
//                     nombre: item.product.nombre,
//                     cantidad: item.cantidad,
//                     precio: item.precioUnitario,
//                     subtotal: item.cantidad * item.precioUnitario
//                 })),
//                 total: venta.total,
//                 fecha: venta.fecha
//             }
//         };

//         res.json(respuesta);

//     } catch (error) {
//         res.status(500).json({ 
//             error: 'Error al obtener venta',
//             details: error.message 
//         });
//     }
// };
// // 4. Obtener Ventas de un Cliente
// export const obtenerVentasCliente = async (req, res) => {
//     try {
//         const { clienteId } = req.params;

//         // 1. Validar cliente
//         const cliente = await Cliente.findById(clienteId);
//         if (!cliente) {
//             return res.status(404).json({ error: 'Cliente no encontrado' });
//         }

//         // 2. Obtener ventas (sin sort en el populate)
//         const ventas = await Venta.find({ cliente: clienteId })
//             .populate({
//                 path: 'products.product',
//                 select: 'id nombre precio' // Incluimos el campo 'id' numérico
//             })
//             .sort({ fecha: -1 }); // Ordenar ventas por fecha (más reciente primero)

//         // 3. Formatear respuesta con ordenamiento manual
//         const respuesta = {
//             success: true,
//             cliente: {
//                 id: cliente._id,
//                 nombre: cliente.nombre,
//                 email: cliente.email
//             },
//             totalVentas: ventas.length,
//             ventas: ventas.map(venta => ({
//                 id: venta._id,
//                 fecha: venta.fecha,
//                 total: venta.total,
//                 productos: venta.products
//                     .map(item => ({
//                         id: item.product.id, // ID numérico que registraste
//                         nombre: item.product.nombre,
//                         precio: item.precioUnitario,
//                         cantidad: item.cantidad,
//                         subtotal: item.precioUnitario * item.cantidad
//                     }))
//                     .sort((a, b) => a.nombre.localeCompare(b.nombre)) // Ordenamos manualmente aquí
//             }))
//         };

//         res.json(respuesta);

//     } catch (error) {
//         res.status(500).json({ 
//             error: 'Error al obtener ventas del cliente',
//             details: error.message 
//         });
//     }
// };

// // 5. Obtener Ventas de un Producto (con filtro de fechas)
// export const obtenerVentasProducto = async (req, res) => {
//     try {
//         const { productoId } = req.params;
//         const { fechaInicio, fechaFin } = req.query;

//         // 1. Validar producto usando el ID numérico
//         const producto = await Producto.findOne({ id: productoId });
//         if (!producto) {
//             return res.status(404).json({ error: 'Producto no encontrado' });
//         }

//         // 2. Construir filtro de fechas
//         const filtroFecha = {};
//         if (fechaInicio) filtroFecha.$gte = new Date(fechaInicio);
//         if (fechaFin) filtroFecha.$lte = new Date(fechaFin);

//         // 3. Buscar ventas que contengan este producto
//         const ventas = await Venta.find({
//             'products.product': producto._id, // Buscar por el _id de MongoDB
//             ...(fechaInicio || fechaFin ? { fecha: filtroFecha } : {})
//         })
//         .populate('cliente', 'nombre email')
//         .sort({ fecha: -1 });

//         // 4. Formatear respuesta
//         const ventasFormateadas = ventas.map(venta => {
//             // Encontrar el producto específico en esta venta
//             const itemProducto = venta.products.find(p => 
//                 p.product.equals(producto._id)
//             );

//             return {
//                 idVenta: venta._id,
//                 fecha: venta.fecha,
//                 cliente: {
//                     id: venta.cliente._id,
//                     nombre: venta.cliente.nombre,
//                     email: venta.cliente.email
//                 },
//                 cantidad: itemProducto.cantidad,
//                 precioUnitario: itemProducto.precioUnitario,
//                 subtotal: itemProducto.cantidad * itemProducto.precioUnitario
//             };
//         });

//         res.json({
//             success: true,
//             producto: {
//                 id: producto.id, // ID numérico que registraste
//                 nombre: producto.nombre,
//                 precioActual: producto.precio
//             },
//             totalVentas: ventas.length,
//             cantidadTotalVendida: ventasFormateadas.reduce((sum, v) => sum + v.cantidad, 0),
//             ventas: ventasFormateadas
//         });

//     } catch (error) {
//         res.status(500).json({ 
//             error: 'Error al obtener ventas del producto',
//             details: error.message 
//         });
//     }
// };
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

