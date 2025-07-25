// import mongoose from 'mongoose';
// import Producto from '../models/productoModel.js';
// import Venta from '../models/ventaModel.js';

// const RecommendationEngine = {
//   /**
//    * Recomendaciones basadas en categorías de compras previas.
//    */
//   async generatePersonalizedRecommendations(clienteId) {
//     const ventas = await Venta.find({ cliente: clienteId }).populate('products.product');
//     if (ventas.length === 0) return this.getGeneralRecommendations();

//     // Extraer categorías y productos comprados
//     const categorias = new Set();
//     const productosIds = new Set();
//     ventas.forEach(v => v.products.forEach(p => {
//       categorias.add(p.product.category);
//       productosIds.add(p.product._id.toString());
//     }));

//     // Buscar productos no comprados en categorías frecuentes
//     const recomendados = await Producto.find({
//       category: { $in: [...categorias] },
//       _id: { $nin: [...productosIds] },
//       stock: { $gt: 0 }
//     })
//     .sort({ SalesTotal: -1 })
//     .limit(5);

//     return recomendados.map(p => ({
//       nombre: p.name,
//       barcode: p.barcode,
//       razon: `Basado en tus compras en ${p.category}`,
//       esDisponible: p.stock > 0,
//       precio: p.price,
//       categoria: p.category
//     }));
//   },

//   /**
//    * Añade datos de la BD a las recomendaciones de IA.
//    */
//   async enriquecerRecomendacionesIA(recomendacionesIA) {
//     const nombres = recomendacionesIA.map(r => r.nombre);
//     const productosBD = await Producto.find({ name: { $in: nombres } });

//     return recomendacionesIA.map(r => {
//       const productoBD = productosBD.find(p => p.name === r.nombre);
//       return {
//         nombre: r.nombre,
//         barcode: productoBD?.barcode || 'N/A',
//         razon: r.razon,
//         esDisponible: productoBD ? productoBD.stock > 0 : false,
//         precio: productoBD?.price || 0,
//         categoria: productoBD?.category || 'General'
//       };
//     });
//   },

//   /**
//    * Recomendaciones generales (más vendidos).
//    */
//   async getGeneralRecommendations() {
//     const productos = await Producto.find({ stock: { $gt: 0 } })
//       .sort({ SalesTotal: -1 })
//       .limit(5);

//     return productos.map(p => ({
//       nombre: p.name,
//       barcode: p.barcode,
//       razon: 'Producto popular',
//       esDisponible: true,
//       precio: p.price,
//       categoria: p.category
//     }));
//   }
// };

// export default RecommendationEngine;




















// // helpers/recommendationHelper.js
// import Producto from '../models/producto.js';
// import Cliente from '../models/cliente.js';

// export const RecommendationEngine = {

//     /**
//      * Genera recomendaciones basadas en historial de compras
//      * @param {ObjectId} clienteId - ID del cliente
//      * @returns {Promise<Array>} - Array de recomendaciones
//      */
//     generatePersonalizedRecommendations: async (clienteId) => {
//         // 1. Obtener cliente con historial
//         const cliente = await Cliente.findById(clienteId)
//             .populate('purchaseHistory.productId', 'name barcode category price stock');
        
//         if (!cliente || cliente.purchaseHistory.length === 0) {
//             return this.getGeneralRecommendations();
//         }

//         // 2. Analizar patrones de compra
//         const purchasePatterns = this.analyzePurchasePatterns(cliente);

//         // 3. Generar recomendaciones
//         const recommendations = [];
        
//         // Recomendación 1: Productos de categorías frecuentes
//         if (purchasePatterns.favoriteCategories.length > 0) {
//             const categoryRecs = await this.getCategoryRecommendations(
//                 purchasePatterns.favoriteCategories,
//                 cliente.purchaseHistory.map(p => p.productId._id)
//             );
//             recommendations.push(...categoryRecs);
//         }

//         // Recomendación 2: Productos complementarios
//         const complementaryRecs = await this.getComplementaryProducts(
//             cliente.purchaseHistory.map(p => p.productId._id)
//         );
//         recommendations.push(...complementaryRecs);

//         // Recomendación 3: Productos frecuentemente comprados juntos
//         const bundleRecs = await this.getFrequentlyBoughtTogether(
//             cliente.purchaseHistory.map(p => p.productId._id)
//         );
//         recommendations.push(...bundleRecs);

//         // Eliminar duplicados y ordenar por relevancia
//         return this.filterAndSortRecommendations(recommendations, cliente);
//     },

//     // Métodos auxiliares
//     analyzePurchasePatterns: (cliente) => {
//         const categoryCount = {};
//         cliente.purchaseHistory.forEach(item => {
//             const category = item.productId.category;
//             categoryCount[category] = (categoryCount[category] || 0) + 1;
//         });

//         return {
//             favoriteCategories: Object.entries(categoryCount)
//                 .sort((a, b) => b[1] - a[1])
//                 .slice(0, 3)
//                 .map(([category]) => category),
//             totalPurchases: cliente.purchaseHistory.length
//         };
//     },

//     getCategoryRecommendations: async (categories, excludedIds) => {
//         return Producto.aggregate([
//             { 
//                 $match: { 
//                     category: { $in: categories },
//                     _id: { $nin: excludedIds },
//                     stock: { $gt: 0 }
//                 } 
//             },
//             { $sample: { size: 3 } },
//             { 
//                 $project: { 
//                     _id: 1, 
//                     name: 1, 
//                     price: 1, 
//                     category: 1,
//                     reason: { $concat: ["Popular en tu categoría favorita: ", "$category"] }
//                 } 
//             }
//         ]);
//     },

//     getComplementaryProducts: async (productIds) => {
//         // Implementar lógica de productos complementarios
//         // Ejemplo: si compra café, recomendar azúcar
//         return []; // Placeholder
//     },

//     getFrequentlyBoughtTogether: async (productIds) => {
//         // Implementar análisis de "comprados juntos"
//         return []; // Placeholder
//     },

//     getGeneralRecommendations: async () => {
//         return Producto.aggregate([
//             { $match: { stock: { $gt: 0 } } },
//             { $sort: { salesCount: -1 } },
//             { $limit: 5 },
//             { 
//                 $project: { 
//                     _id: 1, 
//                     name: 1, 
//                     price: 1,
//                     reason: "Producto más vendido en nuestra tienda" 
//                 } 
//             }
//         ]);
//     },

//     filterAndSortRecommendations: (recommendations, cliente) => {
//         // Eliminar duplicados
//         const uniqueRecs = recommendations.filter(
//             (rec, index, self) => index === self.findIndex(r => r._id.equals(rec._id))
//         );

//         // Ordenar por relevancia (podrías añadir más lógica aquí)
//         return uniqueRecs.slice(0, 5);
//     }
// };