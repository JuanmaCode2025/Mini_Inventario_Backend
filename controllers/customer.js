import Cliente from "../models/cliente.js";
import Producto from "../models/producto.js";
import Venta from "../models/venta.js";
import mongoose from 'mongoose';
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


// Controlador para actualizar la información de un cliente
export const updateCustomer = async (req, res) => {
  try {
    // Obtenemos el cliente actual desde el middleware (req.customerDB)
    const customer = req.customerDB;

    // Si no se encontró el cliente previamente, responder con error 404
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    // matchedData filtra y sanitiza los campos que pasaron las validaciones de express-validator
    const cleanData = matchedData(req);

    // _id nunca debe ser actualizado, lo eliminamos por seguridad
    delete cleanData._id;

    // Actualizamos el cliente usando su _id (ya que puede cambiar el document)
    const updatedCustomer = await Cliente.findByIdAndUpdate(
      customer._id,           // ID del cliente que no cambia nunca
      cleanData,              // Datos limpios y validados a actualizar
      {
        new: true,            // Retorna el documento actualizado
        runValidators: true   // Aplica las validaciones del modelo Mongoose
      }
    ).select('-__v -password'); // Excluye los campos __v y password en la respuesta

    // Respuesta exitosa con el cliente actualizado
    res.status(200).json({
      success: true,
      message: 'Cliente actualizado correctamente',
      data: updatedCustomer
    });

  } catch (error) {
    // Manejo de errores generales (ej: errores del servidor, base de datos, etc.)
    console.error('Error al actualizar cliente:', error);

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
