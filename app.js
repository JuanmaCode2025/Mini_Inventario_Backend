import express from 'express'; // Importar el framework Express para crear el servidor
import dotenv from 'dotenv'; // Importar dotenv para manejar variables de entorno desde el archivo .env
import cors from 'cors'; // Importar el middleware CORS para permitir peticiones desde diferentes dominios

// Importar las rutas definidas para diferentes entidades
import userRoutes from './routes/user.js';
import customerRoutes from './routes/customer.js'
import productsRoutes from './routes/product.js'
import salesroutes from './routes/sale.js'
import connectDB from './config/db.js';


dotenv.config(); // Cargar las variables de entorno del archivo .env a process.env
connectDB(); // Conectar a la base de datos MongoDB

const app = express(); // Crear la instancia de la aplicación Express
app.use(express.json()); // Middleware: Permite que Express entienda datos en formato JSON en las peticiones
app.use(cors()) // Middleware: Habilita CORS para permitir peticiones desde frontends en otros dominios
app.use(express.static(`public`)) //sirve para decirle a Express que sirva archivos estáticos desde la carpeta public.

// Configurar las rutas de la API con sus respectivos endpoints
app.use('/inventario/user', userRoutes);
app.use('/inventario/customer', customerRoutes);
app.use('/inventario/product',productsRoutes);
app.use('/inventario/sale', salesroutes);

// Iniciar el servidor y hacer que escuche en el puerto especificado
app.listen(process.env.PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${process.env.PORT}`);
});