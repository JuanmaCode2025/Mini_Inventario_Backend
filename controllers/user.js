import User from '../models/user.js';
import { generarJWT } from '../middlewares/token.js'
import bcrypt from 'bcryptjs'
import { loginHelpers } from '../helpers/user.js';



export const createUsers = async (req, res) => {
    try {
        const { document, name, email, password } = req.body;
        // Generar un "salt" para hacer el hash más seguro
        // El número 10 indica la complejidad del algoritmo
        // 1. Crear hash de la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        // 2. Crear nuevo usuario
        const newUser = new User({
            document,
            name,
            email,
            password: hashedPassword
        });

        // 3. Guardar en la base de datos
        const savedUser = await newUser.save();

        // 4. Preparar respuesta (sin datos sensibles)
        const userResponse = {
            document: savedUser.document,
            name: savedUser.name,
            email: savedUser.email,
            createdAt: savedUser.createdAt
        };

        // 5. Responder al cliente
        res.status(201).json({
            success: true,
            message: 'Usuario creado exitosamente',
            data: userResponse
        });

    } catch (error) {
        // Manejo específico de errores de duplicado
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'El email ya está registrado'
            });
        }

        // Error general del servidor
        console.error('Error en createUsers:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear usuario'
        });
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Verificar credenciales
        const usuario = await loginHelpers.verificarCredenciales(email, password);

        // Verificar si el usuario está activo (si tu modelo tiene este campo)
        if (usuario.estado === false || usuario.estado === 0) {
            return res.status(400).json({ msg: "Usuario inactivo" });
        }

        // Generar token JWT
        const token = await generarJWT(usuario.document);

        // Enviar respuesta exitosa
        res.json({
            usuario: {
                nombre: usuario.name,
                email: usuario.email,
                document: usuario.document
            },
            token
        });

    } catch (error) {
        console.error('Error en login:', error);
        
        // Mensajes de error seguros
        const statusCode = error.message.includes('Credenciales') ? 400 : 500;
        const mensajeError = statusCode === 400 
            ? 'Credenciales inválidas' 
            : 'Error en el servidor';
        
        res.status(statusCode).json({ 
            success: false,
            msg: mensajeError 
        });
    }
};
