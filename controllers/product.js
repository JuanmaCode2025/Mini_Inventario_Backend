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
        
        // Obtener producto actual desde BD (mejor que confiar en middleware)
        const productoActual = await Producto.findById(id);
        if (!productoActual) {
            return res.status(404).json({ 
                msg: "Producto no encontrado" 
            });
        }

        const camposDirectos = {};
        const camposGenerados = {};

        // 1. CAMPOS DIRECTOS
        const camposPermitidos = ['barcode', 'name', 'details', 'category', 'price', 'stock'];
        camposPermitidos.forEach(campo => {
            if (nuevosDatos[campo] !== undefined) {
                camposDirectos[campo] = nuevosDatos[campo];
            }
        });

        // 2. CAMPOS GENERADOS POR IA
        try {
            // Precio recomendado
            if (nuevosDatos.price !== undefined || nuevosDatos.stock !== undefined) {
                const nombre = nuevosDatos.name || productoActual.name;
                const precio = nuevosDatos.price !== undefined ? nuevosDatos.price : productoActual.price;
                const stock = nuevosDatos.stock !== undefined ? nuevosDatos.stock : productoActual.stock;
                
                camposGenerados.recommendationPrice = await generarRecomendacionPrecio(nombre, precio, stock);
            }

            // Descripción
            if (nuevosDatos.name !== undefined || nuevosDatos.category !== undefined) {
                const nombre = nuevosDatos.name || productoActual.name;
                const categoria = nuevosDatos.category || productoActual.category;
                
                camposGenerados.description = await generarDescripcion(nombre, categoria);
            }
        } catch (error) {
            console.error("Error en generación IA:", error);
            // Continuar sin los campos generados
        }

        // 3. ACTUALIZAR
        const todosLosCambios = { ...camposDirectos, ...camposGenerados };
        
        if (Object.keys(todosLosCambios).length === 0) {
            return res.status(400).json({
                msg: "No se enviaron datos para actualizar",
                producto: productoActual
            });
        }

        const productoActualizado = await Producto.findByIdAndUpdate(
            id,
            todosLosCambios,
            { 
                new: true,
                runValidators: true
            }
        );

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

        res.status(500).json({ 
            msg: "Error interno del servidor",
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