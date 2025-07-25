import Producto from "../models/producto.js";

export const ProductHelpers = {
    validateBarcode: async (barcode, { req }) => {
        const code = String(barcode || '').trim();
        
        // Validación de requerido
        if (!code) throw new Error('El código de barras es requerido');
        
        // Validación de tipo numérico
        if (!/^\d+$/.test(code)) {
            throw new Error('El código de barras solo puede contener números (0-9)');
        }
        
        // Validación de longitud
        const validLengths = [8, 12, 13, 14];
        if (!validLengths.includes(code.length)) {
            throw new Error(`Longitud inválida (${code.length} dígitos). Los códigos deben tener ${validLengths.join(', ')} dígitos`);
        }
        
        // Validación de entero
        const barcodeNumber = Number(code);
        if (!Number.isInteger(barcodeNumber)) {
            throw new Error('El código de barras debe ser un número entero');
        }

        // Validación de unicidad
        const query = { barcode: barcodeNumber };
        if (req.params?.barcode) {
            query.barcode = { $ne: Number(req.params.barcode) };
        }

        const exists = await Producto.exists(query);
        if (exists) throw new Error('Este código de barras ya está registrado');

        return true;
    },

    validateName: async (name, { req }) => {
        const nameStr = String(name || '').trim();
        
        // Validación de requerido
        if (!nameStr) throw new Error('El nombre del producto es requerido');
        
        // Validación de longitud
        if (nameStr.length < 2) throw new Error('El nombre debe tener al menos 2 caracteres');
        if (nameStr.length > 50) throw new Error('El nombre no puede exceder los 50 caracteres');
        
        // Validación de caracteres permitidos
        if (!/^[a-záéíóúñü0-9\s'\-.,;]+$/i.test(nameStr)) {
            throw new Error('El nombre contiene caracteres no permitidos');
        }

        // Validación de unicidad
        const query = { name: { $regex: new RegExp(`^${nameStr}$`, 'i') } };
        if (req.params?.barcode) {
            const product = await Producto.findOne({ barcode: Number(req.params.barcode) });
            if (product) query._id = { $ne: product._id };
        }

        const exists = await Producto.exists(query);
        if (exists) throw new Error('Ya existe un producto con este nombre');

        return true;
    },
 validateDetails: (details) => {
    // Asegurarse de que details existe
    if (details === undefined || details === null) {
        throw new Error('Los detalles son requeridos');
    }

    // Convertir a string (por si acaso es un número u otro tipo)
    const detailStr = String(details).trim();

    // Validar longitud
    if (detailStr.length < 10) {
        throw new Error('Los detalles deben tener al menos 10 caracteres');
    }

    if (detailStr.length > 1000) { // Aumenté el límite a 1000 caracteres
        throw new Error('Los detalles no deben superar los 1000 caracteres');
    }

    return true;
},


    validateCategory: (category) => {
        const categoryStr = String(category || '').trim();
        
        // Validación de requerido
        if (!categoryStr) throw new Error('La categoría es requerida');
        
        // Validación de longitud
        if (categoryStr.length < 2) throw new Error('La categoría debe tener al menos 2 caracteres');
        if (categoryStr.length > 50) throw new Error('La categoría no puede exceder los 50 caracteres');
        
        // Validación de caracteres permitidos
        if (!/^[a-záéíóúñü\s'-]+$/i.test(categoryStr)) {
            throw new Error('La categoría solo puede contener letras y espacios');
        }

        return true;
    },

    validatePrice: (price) => {
        // Validación de requerido
        if (price === undefined || price === null) {
            throw new Error('El precio es requerido');
        }
        
        // Conversión a número
        const priceNum = Number(price);
        
        // Validación de tipo numérico
        if (isNaN(priceNum)) {
            throw new Error('El precio debe ser un número válido');
        }
        
        // Validación de valor positivo
        if (priceNum < 0) {
            throw new Error('El precio no puede ser negativo');
        }
        
        // Validación de decimales (2 máximo)
        if (Math.round(priceNum * 100) !== priceNum * 100) {
            throw new Error('El precio no puede tener más de 2 decimales');
        }

        return true;
    },

    validateStock: (stock) => {
        // Validación de requerido
        if (stock === undefined || stock === null) {
            throw new Error('La cantidad en stock es requerida');
        }
        
        // Conversión a entero
        const stockInt = parseInt(stock);
        
        // Validación de tipo entero
        if (isNaN(stockInt)) {
            throw new Error('El stock debe ser un número entero válido');
        }
        
        // Validación de valor positivo
        if (stockInt < 0) {
            throw new Error('El stock no puede ser negativo');
        }

        return true;
    },

    existProductByBarcode: async (barcode, { req }) => {
        const code = String(barcode || '').trim();
        
        // Validación de requerido
        if (!code) throw new Error('El código de barras es requerido');
        
        // Conversión a número
        const barcodeNumber = Number(code);
        if (isNaN(barcodeNumber)) throw new Error('Código de barras inválido');
        
        // Búsqueda en BD
        const product = await Producto.findOne({ barcode: barcodeNumber });
        if (!product) throw new Error(`No existe un producto con el código: ${code}`);
        
        // Almacenar en request para uso posterior
        req.productDB = product;
        
        return true;
    }
};