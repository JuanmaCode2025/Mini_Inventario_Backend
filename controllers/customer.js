import Cliente from "../models/cliente.js";
//import { generarRecomendaciones } from "../api.js";
import { matchedData } from 'express-validator';


export const createCustomer = async (req, res) => {
  try {
    const cleanData = matchedData(req);
    const customer = await Cliente.create(cleanData);

    res.status(201).json({
      success: true,
      message: 'Cliente creado exitosamente',
      data: {
        document: customer.document,
        name: customer.name,
        email: customer.email
      }
    });
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const listCustomers = async (req, res) => {
  try {
    const lista = await Cliente.find({});
    if (lista.length === 0) {
      res.status(200).json({
        msg: "No hay clientes Registrados en la DB",
        lista: []
      })
    } else {
      res.status(200).json({
        total: lista.length,
        lista
      })
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      msg: " Error al cargar los Clientes"
    })

  }

};

// Controlador para obtener la información de un cliente específico
export const getCustomer = async (req, res) => {
  try {
    // Obtener el cliente previamente cargado en el request por un helper o middleware (por ejemplo, por documento)
    const customer = req.customerDB;

    // Si no se encuentra el cliente en el request, devolver error 404
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    // Devolver respuesta exitosa con los datos del cliente
    res.status(200).json({
      success: true,
      data: {      
        document: customer.document, // Número de documento del cliente
        name: customer.name,         // Nombre del cliente
        email: customer.email,       // Correo electrónico
        phone: customer.phone,       // Teléfono
        address: customer.address    // Dirección
      }
    });

  } catch (error) {
    // Captura de errores inesperados y respuesta de error 500
    console.error('Error al obtener cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const putActivarCustomer = async (req, res)=>{
    const { id } = req.params;    
    try {
        const buscar = await Cliente.findOne({ _id: id });        
        if (!buscar) {
            return res.status(404).json({ msg: "Este Cliente no existe" });
        }        
        // Verificar si ya está inactivo
        if (buscar.status === 1) {
            return res.status(400).json({ msg: "El Cliente ya está activo" });
        }        
        const productoActualizado = await Cliente.findByIdAndUpdate(
            id,
            { status: 1 },
            { new: true } // Devuelve el documento actualizado
        );        
        res.status(200).json({ 
            msg: "Cliente Activado exitosamente",
            producto: productoActualizado 
        });        
    } catch (error) {
        console.log(error);
        
        console.log("Error al activar producto:", error);
        res.status(500).json({ 
            msg: "Error interno del servidor",
            error: error.message 
        });
    }    
}

export const putDesactivarCustomer = async (req, res)=>{
 const { id } = req.params;    
    try {
        const buscar = await Cliente.findOne({ _id: id });        
        if (!buscar) {
            return res.status(404).json({ msg: "Este Cliente no existe" });
        }        
        // Verificar si ya está inactivo
        if (buscar.status === 0) {
            return res.status(400).json({ msg: "El Cliente ya está Desactivo" });
        }        
        const productoActualizado = await Cliente.findByIdAndUpdate(
            id,
            { status: 0 },
            { new: true } // Devuelve el documento actualizado
        );        
        res.status(200).json({ 
            msg: "Cliente Desactivado exitosamente",
            producto: productoActualizado 
        });        
    } catch (error) {
        console.log(error);
        
        console.log("Error al desactivar producto:", error);
        res.status(500).json({ 
            msg: "Error interno del servidor",
            error: error.message 
        });
    }   
}


// Controlador para actualizar la información de un cliente
export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el cliente existe
    const customerExists = await Cliente.findById(id);
    if (!customerExists) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    // Obtener datos validados
    const cleanData = matchedData(req);
    
    // Eliminar campos que no deben actualizarse
    delete cleanData._id;
    delete cleanData.id;

    // Si no hay datos para actualizar
    if (Object.keys(cleanData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionaron datos para actualizar'
      });
    }

    // Actualizar el cliente
    const updatedCustomer = await Cliente.findByIdAndUpdate(
      id,
      cleanData,
      {
        new: true,            // Retorna el documento actualizado
        runValidators: true   // Aplica validaciones del modelo
      }
    ).select('-__v -password'); // Excluir campos sensibles

    res.status(200).json({
      success: true,
      message: 'Cliente actualizado correctamente',
      data: updatedCustomer
    });

  } catch (error) {
    console.error('Error al actualizar cliente:', error);

    // Manejar errores de validación de Mongoose
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Error de validación de datos',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    // Manejar errores de duplicados
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'El documento o email ya existe'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};


// Controlador para eliminar un cliente de la base de datos
export const deleteCustomer = async (req, res) => {
  try {
    // Obtener el cliente previamente validado y cargado desde un middleware o helper (por ejemplo, buscar por documento)
    const customer = req.customerDB;

    // Verificar si el cliente existe en el request; si no, retornar error 404
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    // Eliminar permanentemente el cliente de la base de datos usando su documento
    const deletedCustomer = await Cliente.findOneAndDelete({ 
      document: customer.document 
    });

    // Verificar si el cliente fue eliminado correctamente
    if (!deletedCustomer) {
      return res.status(404).json({
        success: false,
        message: 'No se pudo eliminar el cliente'
      });
    }

    // Si todo fue bien, devolver respuesta exitosa con información del cliente eliminado
    res.status(200).json({
      success: true,
      message: 'Cliente eliminado permanentemente de la base de datos',
      data: {
        document: deletedCustomer.document,
        name: deletedCustomer.name
      }
    });

  } catch (error) {
    // Captura de errores inesperados y respuesta de error 500
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      // Solo mostrar mensaje de error en entorno de desarrollo
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
