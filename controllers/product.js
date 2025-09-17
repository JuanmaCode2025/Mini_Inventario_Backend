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
        const Producto = await Producto.find({});
        res.status(200).json({
            total: Producto.length,
            Producto
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

// Controlador para editar un producto existente
export const product_edit = async (req, res) => {
    try {
        // Extrae el ID del producto desde los parámetros de la URL (ej: /Producto/:id)
        const { id } = req.params;

        // Datos enviados por el cliente para actualizar (por ejemplo, { name, price, stock, etc. })
        const datosActualizados = req.body;

        // Producto actual, obtenido previamente y almacenado en req.productDB por un middleware
        const productoActual = req.productDB;

        // Objeto para almacenar los campos que se van a actualizar directamente
        const updates = {};

        // Objeto para almacenar los campos que serán generados automáticamente (por IA)
        const needsUpdate = {};

        // ================================
        // Agrega solo los campos que vienen en el body (evita sobreescribir campos no enviados)
        // ================================
        if (datosActualizados.name) updates.name = datosActualizados.name;
        if (datosActualizados.category) updates.category = datosActualizados.category;
        if (datosActualizados.price) updates.price = datosActualizados.price;
        if (datosActualizados.stock) updates.stock = datosActualizados.stock;
        if (datosActualizados.details) updates.details = datosActualizados.details;
        if (datosActualizados.barcode) updates.barcode = datosActualizados.barcode; // El barcode ahora es editable

        // ================================
        // Si cambia el precio o el stock, generar un nuevo precio recomendado usando IA
        // ================================
        if (datosActualizados.price || datosActualizados.stock) {
            needsUpdate.recommendationPrice = await generarRecomendacionPrecio(
                // Se usa el nuevo valor si existe, si no, se mantiene el actual
                updates.name || productoActual.name,
                updates.price || productoActual.price,
                updates.stock || productoActual.stock
            );
        }

        // ================================
        // Si cambia el nombre o la categoría, generar una nueva descripción con IA
        // ================================
        if (datosActualizados.name || datosActualizados.category) {
            needsUpdate.description = await generarDescripcion(
                updates.name || productoActual.name,
                updates.category || productoActual.category
            );
        }

        // ================================
        // Actualiza el producto en la base de datos usando el ID
        // Combina los campos enviados por el cliente (updates) y los generados (needsUpdate)
        // ================================
        const productoActualizado = await Producto.findByIdAndUpdate(
            id,
            { ...updates, ...needsUpdate },
            {
                new: true,             // Retorna el documento actualizado
                runValidators: true   // Aplica validaciones definidas en el modelo de Mongoose
            }
        );

        // ================================
        // Respuesta exitosa
        // ================================
        res.status(200).json({
            msg: "Producto actualizado",
            producto: productoActualizado
        });

    } catch (error) {
        // ================================
        // Manejo de errores
        // ================================
        console.error(error);
        res.status(500).json({ 
            msg: "Error al actualizar producto",
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