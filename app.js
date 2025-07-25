import express from 'express';
import dotenv from 'dotenv';
import userRoutes from './routes/user.js';
import customerRoutes from './routes/customer.js'
import productsRoutes from './routes/product.js'
import salesroutes from './routes/sale.js'
import connectDB from './config/db.js';


dotenv.config();
connectDB(); // Conectar a la base de datos MongoDB

const app = express();
app.use(express.json());

app.use('/inventario/user', userRoutes);
app.use('/inventario/customer', customerRoutes);
app.use('/inventario/product',productsRoutes);
app.use('/inventario/sale', salesroutes);

app.listen(3000, () => {
  console.log('Servidor escuchando en puerto 3000');
});


// server.js

// import express from 'express';
// import { generarDescripcion, generarRecomendacionPrecio } from './api.js';

// const app = express();
// app.use(express.json());
// const PORT = 3000;

// // Ruta para generar descripción
// app.post('/generar/descripcion', async (req, res) => {
//   const { nombre, categoria } = req.body;

//   if (!nombre || !categoria) {
//     return res.status(400).json({ error: 'Faltan datos: nombre y categoría' });
//   }

//   const descripcion = await generarDescripcion(nombre, categoria);
//   res.json({ nombre, categoria, descripcion });
// });

// // Ruta para generar precio (usa la descripción generada)
// app.post('/generar/precio', async (req, res) => {
//   const { nombre, categoria, descripcion } = req.body;

//   if (!nombre || !categoria || !descripcion) {
//     return res.status(400).json({ error: 'Faltan datos: nombre, categoría y descripción' });
//   }

//   const precio = await generarRecomendacionPrecio(nombre, categoria, descripcion);
//   res.json({ nombre, categoria, descripcion, precio });
// });

// // Iniciar servidor
// app.listen(PORT, () => {
//   console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
// });