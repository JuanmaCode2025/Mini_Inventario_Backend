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
        const { barcode } = req.params;
        const datosActualizados = req.body;
        const productoActual = req.productDB;

        const updates = {};
        const needsUpdate = {};

        // Campos básicos
        if (datosActualizados.name) updates.name = datosActualizados.name;
        if (datosActualizados.name) updates.details = datosActualizados.details
        if (datosActualizados.category) updates.category = datosActualizados.category;
        if (datosActualizados.price) updates.price = datosActualizados.price;
        if (datosActualizados.stock) updates.stock = datosActualizados.stock;

        // Actualizaciones IA
        if (datosActualizados.price || datosActualizados.stock) {
            needsUpdate.recommendationPrice = await generarRecomendacionPrecio(
                updates.name || productoActual.name,
                updates.price || productoActual.price,
                updates.stock || productoActual.stock
            );
        }

        if (datosActualizados.name || datosActualizados.category) {
            needsUpdate.description = await generarDescripcion(
                updates.name || productoActual.name,
                updates.category || productoActual.category
            );
        }

        const productoActualizado = await Producto.findOneAndUpdate(
            { barcode: Number(barcode) },
            { ...updates, ...needsUpdate },
            { new: true, runValidators: true }
        );
        
        res.status(200).json({
            msg: "Producto actualizado",
            producto: productoActualizado
        });
    } catch (error) {
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