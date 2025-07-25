import Producto from '../models/producto.js';
import Cliente from '../models/cliente.js';
import Venta from '../models/venta.js';

export const SaleValidators = {
validateDocument: async (document) => {
    if (!document) throw new Error('Documento es requerido');
    
    // Convertir a número y validar formato
    const docNumber = Number(document);
    if (isNaN(docNumber)) throw new Error('Documento debe ser numérico');
    
    // Buscar cliente
    const cliente = await Cliente.findOne({ document: docNumber });
    if (!cliente) throw new Error('Cliente no encontrado');
    
    return cliente;
},

    validateBarcode: async (barcode) => {
        if (!barcode) throw new Error('Barcode es requerido');
        const producto = await Producto.findOne({ barcode: Number(barcode) });
        if (!producto) throw new Error(`Producto ${barcode} no encontrado`);
        if (producto.stock < 1) throw new Error(`Producto ${producto.name} sin stock`);
        if (!producto.price || producto.price <= 0) throw new Error(`Precio inválido para ${producto.name}`);
        return producto; // Retornamos el producto encontrado
    },

    validateQuantity: (quantity) => {
        if (!quantity || quantity < 1) throw new Error('Cantidad debe ser mayor a 0');
        return true;
    },

    validatePaymentMethod: (method) => {
        const validMethods = ['efectivo', 'tarjeta', 'transferencia', 'otro'];
        if (!validMethods.includes(method)) {
            throw new Error(`Método de pago inválido. Use: ${validMethods.join(', ')}`);
        }
        return true;
    },

    validateSaleExist: async (id) => {
    const venta = await Venta.findById(id);
    if (!venta) {
        throw new Error(`Venta con ID ${id} no encontrada`);
    }
    return true; // Importante retornar true si pasa la validación
},

    validateDateRange: (dates) => {
        if (dates.desde && isNaN(new Date(dates.desde))) {
            throw new Error('Fecha desde inválida');
        }
        if (dates.hasta && isNaN(new Date(dates.hasta))) {
            throw new Error('Fecha hasta inválida');
        }
        return true;
    }
};