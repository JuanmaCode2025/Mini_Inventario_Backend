import Producto from "../models/producto.js"; 
import { generarDescripcion, generarRecomendacionPrecio } from "../api.js";

export const create_product = async (req, res) => {
    try {
        const { barcode, name,details, category, price, stock } = req.body;

        const [iadescripcion, recomendacionIA] = await Promise.all([
            generarDescripcion(name, category, details),
            generarRecomendacionPrecio(name, category, details)
        ]);

        const producto = new Producto({
            barcode: Number(barcode),
            name,
            details,
            category,
            price,
            stock,
            SalesTotal: 0,
            recommendationPrice: recomendacionIA,
            description: iadescripcion
        });

        await producto.save();
        
        res.status(201).json({ 
            msg: "Producto creado correctamente",
            producto 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            msg: "Error al crear producto",
            error: error.message 
        });
    }
};

export const Productlist = async (req, res) => {
    try {
        const listProductos = await Producto.find({});
        res.status(200).json({
            total: Producto.length,
            listProductos
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            msg: "Error al obtener Producto",
            error: error.message 
        });
    }
};

export const buscar_producto = async (req, res) => {
    try {
        const product = req.productDB;
        res.status(200).json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            msg: "Error al buscar producto",
            error: error.message 
        });
    }
};

export const product_edit = async (req, res) => {
    try {
        const { id } = req.params;
        const nuevosDatos = req.body;
        const productoActual = req.productDB;

        // OBJETOS PARA ACTUALIZACIONES
        const camposDirectos = {};     // Campos que vienen del frontend
        const camposGenerados = {};    // Campos generados por IA

        // 1. ACTUALIZAR CAMPOS DIRECTOS (si fueron enviados)
        if (nuevosDatos.barcode !== undefined) camposDirectos.barcode = nuevosDatos.barcode;
        if (nuevosDatos.name !== undefined) camposDirectos.name = nuevosDatos.name;
        if (nuevosDatos.details !== undefined) camposDirectos.details = nuevosDatos.details;
        if (nuevosDatos.category !== undefined) camposDirectos.category = nuevosDatos.category;
        if (nuevosDatos.price !== undefined) camposDirectos.price = nuevosDatos.price;
        if (nuevosDatos.stock !== undefined) camposDirectos.stock = nuevosDatos.stock;

        // 2. GENERAR CAMPOS AUTOMÁTICOS CON IA
        // Precio recomendado si cambia precio o stock
        if (nuevosDatos.price !== undefined || nuevosDatos.stock !== undefined) {
            const nombre = nuevosDatos.name || productoActual.name;
            const precio = nuevosDatos.price !== undefined ? nuevosDatos.price : productoActual.price;
            const stock = nuevosDatos.stock !== undefined ? nuevosDatos.stock : productoActual.stock;
            
            camposGenerados.recommendationPrice = await generarRecomendacionPrecio(nombre, precio, stock);
        }

        // Descripción si cambia nombre o categoría
        if (nuevosDatos.name !== undefined || nuevosDatos.category !== undefined) {
            const nombre = nuevosDatos.name || productoActual.name;
            const categoria = nuevosDatos.category || productoActual.category;
            
            camposGenerados.description = await generarDescripcion(nombre, categoria);
        }

        // 3. COMBINAR Y ACTUALIZAR
        const todosLosCambios = { ...camposDirectos, ...camposGenerados };

        // Verificar que hay algo que actualizar
        if (Object.keys(todosLosCambios).length === 0) {
            return res.status(400).json({
                msg: "No se enviaron datos para actualizar",
                producto: productoActual
            });
        }

        // 4. EJECUTAR ACTUALIZACIÓN EN BASE DE DATOS
        const productoActualizado = await Producto.findByIdAndUpdate(
            id,  // Usar el ID del parámetro
            todosLosCambios,
            { 
                new: true,            // Devuelve el documento actualizado
                runValidators: true   // Ejecuta validaciones del schema
            }
        );

        // Verificar si se encontró y actualizó el producto
        if (!productoActualizado) {
            return res.status(404).json({ 
                msg: "Producto no encontrado" 
            });
        }

        // 5. RESPUESTA EXITOSA
        res.status(200).json({
            msg: "Producto actualizado correctamente",
            producto: productoActualizado,
            cambios: {
                directos: Object.keys(camposDirectos),
                generados: Object.keys(camposGenerados)
            }
        });

    } catch (error) {
        console.error("Error en product_edit:", error);
        
        // Manejar errores específicos
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                msg: "Error de validación de datos",
                error: error.message 
            });
        }
        
        if (error.name === 'CastError') {
            return res.status(400).json({ 
                msg: "ID de producto inválido" 
            });
        }

        // Error general
        res.status(500).json({ 
            msg: "Error interno del servidor al actualizar producto",
            error: error.message 
        });
    }
};

export const putActivarProducto = async (req, res)=>{
    const {id} = req.params
    const buscar = await Producto.findOne({_id:id})
    try {
        if (!buscar){
        res.status(400).json({msg: "Este producto no existe"})
    }else{
        await Producto.findByIdAndUpdate({_id:id},{
            estado:1
        })
        res.status(200).json({ msg: "Producto activo", buscar })
    }
    } catch (error) {
        res.status(400).json(error)
    }
    
}

export const putDesactivarProducto = async (req, res)=>{
    const {id} = req.params
    const buscar = await Producto.findOne({_id:id})
    try {
        if (!buscar){
        res.status(400).json({msg: "Este producto no existe"})
    }else{
        await Producto.findByIdAndUpdate({_id:id},{
            estado:0
        })
        res.status(200).json({ msg: "Producto inactivo", buscar })
    }
    } catch (error) {
        res.status(400).json(error)
    }
    
}



export const delete_producto = async (req, res) => {
    try {
        const { barcode } = req.params;
        const productoEliminado = await Producto.findOneAndDelete({ 
            barcode: Number(barcode) 
        });
        
        res.status(200).json({ 
            msg: "Producto eliminado correctamente",
            barcode: productoEliminado.barcode
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            msg: "Error al eliminar producto",
            error: error.message
        });
    }
};