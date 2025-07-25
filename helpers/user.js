import User from '../models/user.js';
import bcrypt from 'bcryptjs';


export const UserHelpers = {

    // Validación completa para documento
    validarDocumento: async (document, { req }) => {
        if (!document) throw new Error('El documento es requerido');
        if (!/^\d{10}$/.test(document)) throw new Error('El documento debe tener 10 dígitos');

        const existe = await User.findOne({ document });
        if (!existe) return;

        if (req.method === 'POST') throw new Error(`Documento ${document} ya registrado`);
        if (req.method === 'PUT' && existe.document !== req.body.document) {
            throw new Error(`Documento ${document} pertenece a otro usuario`);
        }
    },

    // Validación completa para nombre
    validarNombre: (name) => {
        if (!name) throw new Error('El nombre es requerido');
        if (name.length < 2 || name.length > 30) {
            throw new Error('El nombre debe tener entre 2 y 30 caracteres');
        }
        return true;
    },



    // Validación completa para email
    validarEmail: async (email, { req }) => {
        if (!email) throw new Error('El email es requerido');
        if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(email)) {
            throw new Error('El correo debe ser @gmail.com');
        }

        const existe = await User.findOne({ email });
        if (!existe) return;

        if (req.method === 'POST') throw new Error(`Email ${email} ya registrado`);
        if (req.method === 'PUT' && existe.document !== req.body.document) {
            throw new Error(`Email ${email} pertenece a otro usuario`);
        }
    },

    // Validación completa para password
    validarPassword: (password) => {
        if (!password) throw new Error('La contraseña es requerida');
        if (password.length < 8) throw new Error('La contraseña debe tener mínimo 8 caracteres');
        return true;
    },

    // Helper para verificar usuario por documento
    // existeUsuarioPorDocumento: async (document, { req }) => {
    //     const usuario = await User.findOne({ document });
    //     if (!usuario) throw new Error(`Usuario con documento ${document} no existe`);
    //     req.userDB = usuario;
    // }
};




export const loginHelpers = {
    validarEmailLogin: async (email) => {
        if (!email) throw new Error('El email es requerido');
        if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(email)) {
            throw new Error('El correo debe ser @gmail.com');
        }
        return true;
    },

    validarPasswordLogin: (password) => {
        if (!password) throw new Error('La contraseña es requerida');
        if (password.length < 8) throw new Error('La contraseña debe tener al menos 8 caracteres');
        return true;
    },

    verificarCredenciales: async (email, password) => {
        const usuario = await User.findOne({ email });
        if (!usuario) throw new Error('Credenciales inválidas');
        
        const validaPassword = await bcrypt.compare(password, usuario.password);
        if (!validaPassword) throw new Error('Credenciales inválidas');
        
        return usuario;
    }
};
