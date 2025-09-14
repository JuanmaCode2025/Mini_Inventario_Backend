import { GoogleGenerativeAI } from "@google/generative-ai";
import 'dotenv/config';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
//en proceso

import mongoose from "mongoose";
// Importación de modelos
import Cliente from "./models/cliente.js";
import Venta from "./models/venta.js";
import Producto from "./models/producto.js";

export async function recomendar(req, res) {
  try {
    const { document } = req.body;

    // Validación básica
    if (!document) {
      return res.status(400).json({ error: "Documento requerido" });
    }

    // Buscar cliente
    const cliente = await Cliente.findOne({ document });
    if (!cliente) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    // Obtener historial de compras
    const ventas = await Venta.find({ cliente: cliente._id })
      .populate('products.product')
      .sort({ fecha: -1 });

    // Obtener todos los productos disponibles
    const productosDisponibles = await Producto.find({ stock: { $gt: 0 } });

    // Generar recomendaciones con IA
    const recomendaciones = await generarRecomendacionesIA({
      nombreCliente: cliente.name,
      historialCompras: ventas,
      productosDisponibles
    });

    res.json(recomendaciones);

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error al generar recomendaciones" });
  }
}

// Función principal para generar recomendaciones con IA
async function generarRecomendacionesIA({ nombreCliente, historialCompras, productosDisponibles }) {
  // Preparar datos para el prompt
  const datosCliente = prepararDatosCliente(historialCompras);
  
  // Prompt optimizado para recomendaciones
  const prompt = `
    Eres un experto en recomendaciones de productos para una tienda en línea. 
    Analiza el historial del cliente y los productos disponibles para hacer recomendaciones personalizadas.

    **Datos del Cliente:**
    - Nombre: ${nombreCliente}
    - Total comprado: ${datosCliente.totalProductos} productos
    - Categorías frecuentes: ${datosCliente.categoriasFrecuentes.join(', ') || 'Ninguna'}
    - Últimos productos comprados: ${datosCliente.ultimosProductos.join(', ') || 'Ninguno'}

    **Productos Disponibles (${productosDisponibles.length} disponibles):**
    ${productosDisponibles.slice(0, 20).map(p => `- ${p.name} (${p.category}): $${p.price}`).join('\n')}
    ${productosDisponibles.length > 20 ? '\n...y más productos disponibles...' : ''}

    **Instrucciones:**
    1. Genera 3-5 recomendaciones altamente relevantes
    2. Prioriza productos que complementen compras anteriores
    3. Incluye al menos 1 novedad interesante
    4. Considera el precio y categorías frecuentes
    5. Explica brevemente cada recomendación

    **Formato de respuesta (solo JSON):**
    {
      "mensaje": "Mensaje personalizado al cliente",
      "recomendaciones": [
        {
          "nombre": "Nombre del producto",
          "categoria": "Categoría",
          "precio": 00.00,
          "razon": "Razón de la recomendación"
        }
      ],
      "analisis": "Breve análisis del patrón de compras"
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Limpiar y parsear la respuesta
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);

  } catch (error) {
    console.error("Error con IA:", error);
    return generarRecomendacionesBasicas(datosCliente, productosDisponibles);
  }
}

// Función para preparar datos del cliente
function prepararDatosCliente(historialCompras) {
  const categorias = new Set();
  const productos = [];
  let total = 0;

  historialCompras.forEach(venta => {
    venta.products.forEach(item => {
      if (item.product) {
        total += item.quantity;
        productos.push(item.product.name);
        if (item.product.category) {
          categorias.add(item.product.category);
        }
      }
    });
  });

  return {
    totalProductos: total,
    categoriasFrecuentes: Array.from(categorias),
    ultimosProductos: productos.slice(0, 3)
  };
}

// Función de respaldo sin IA
function generarRecomendacionesBasicas(datosCliente, productosDisponibles) {
  const recomendados = datosCliente.categoriasFrecuentes.length > 0
    ? productosDisponibles.filter(p => datosCliente.categoriasFrecuentes.includes(p.category))
    : productosDisponibles;

  return {
    mensaje: `Hola ${datosCliente.nombreCliente}, te recomendamos:`,
    recomendaciones: recomendados.slice(0, 5).map(p => ({
      nombre: p.name,
      categoria: p.category,
      precio: p.price,
      razon: datosCliente.categoriasFrecuentes.includes(p.category)
        ? `Similar a tus compras en ${p.category}`
        : "Producto destacado"
    })),
    analisis: datosCliente.categoriasFrecuentes.length > 0
      ? `Basado en tus compras en ${datosCliente.categoriasFrecuentes.join(', ')}`
      : "Productos populares"
  };
}

/**
 * Función: Generar Descripción Automática
 */

export async function generarDescripcion(nombreProducto, categoria, details) {
  const prompt = `
      Genera una descripción atractiva y profesional para el siguiente producto:
      
      Nombre del producto: ${nombreProducto}
      Categoría: ${categoria}
      Detalles del Producto que se lo coloque ne la descripcion ${details}
      
      La descripción debe:
      - Ser persuasiva y orientada a ventas
      - Destacar características principales y beneficios
      - Tener entre 20 -50 palabras
      - Ser apropiada para comercio electrónico
      - Incluir palabras clave relevantes para SEO
      - Mantener un tono profesional pero accesible
      -ser direfto qu tiene el producto
      
      Responde únicamente con la descripción del producto, sin texto adicional.
    `;
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error al generar la descripción:", error.message);
    return "No se pudo generar una descripción.";
  }
}

/**
 * Función: Generar Recomendación de Precio
 */
export async function generarRecomendacionPrecio(nombreProducto, categoria, descripcion) {
  const prompt = `Basado en esta información, recomienda un precio aproximado:
  Nombre del Producto: "${nombreProducto}"
  Categoría: "${categoria}"
  Descripción: "${descripcion}" y con la detalles cuadre el precio
  -Ponle en tipo de modena esta utiliza
  -ajustar precios según tendencias del mercado. 

  Solo responde con un número o rango de precio (ej. $50 - $70 USD).`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Error al generar la recomendación de precio:", error.message);
    return "No se pudo generar un precio.";
  }
}