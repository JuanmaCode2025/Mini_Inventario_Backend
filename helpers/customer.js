import Cliente from "../models/cliente.js";
import User from "../models/user.js";

export const customerHelpers = {
    // ✅ Validación del número de documento
    validateDocument: async (document, { req }) => {
        if (!document && document !== 0) throw new Error('El documento es requerido');
        
        // Convertir a número
        const docNumber = Number(document);
        if (isNaN(docNumber)) throw new Error('El documento debe ser numérico');
        
        // Validar exactamente 10 dígitos
        if (!/^\d{10}$/.test(docNumber.toString())) {
            throw new Error('El documento debe tener exactamente 10 dígitos');
        }

        // Consulta en ambas colecciones
        const [existInCliente, existInUser] = await Promise.all([
            Cliente.findOne({ document: docNumber }),
            User.findOne({ document: docNumber })
        ]);

        const documentExists = existInCliente || existInUser;

        if (!documentExists) return true;

        if (req.method === 'POST') {
            throw new Error(`El documento ${docNumber} ya está registrado`);
        }

        if (req.method === 'PUT') {
            const currentId = req.params.id;
            const isSameRecord = (existInCliente?._id.equals(currentId)) || 
                               (existInUser?._id.equals(currentId));
            
            if (!isSameRecord) {
                throw new Error(`El documento ${docNumber} pertenece a otro usuario`);
            }
        }

        return true;
    },
    // ✅ Validación del nombre del cliente
    validateName: (name) => {
        if (!name?.trim()) throw new Error('El nombre es requerido');

        const trimmedName = name.trim();

        // Verifica que el nombre tenga entre 2 y 50 caracteres
        if (trimmedName.length < 2 || trimmedName.length > 50) {
            throw new Error("El nombre debe tener entre 2 y 50 caracteres");
        }

        // Verifica que solo tenga letras (incluye tildes y ñ) y espacios
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/.test(trimmedName)) {
            throw new Error("El nombre contiene caracteres no permitidos");
        }

        return true;
    },

    // ✅ Validación del correo electrónico
    validateEmail: async (email, { req }) => {
        if (!email?.trim()) throw new Error('El email es requerido');

        const trimmedEmail = email.trim().toLowerCase();

        // Solo se permiten correos @gmail.com
        if (!/^[a-z0-9._%+-]+@gmail\.com$/.test(trimmedEmail)) {
            throw new Error('Debe ser un email válido de @gmail.com');
        }

        // Verificar si el correo ya existe en Cliente o User
        const [existeEnCliente, existeEnUser] = await Promise.all([
            Cliente.findOne({ email: trimmedEmail }),
            User.findOne({ email: trimmedEmail })
        ]);

        const existe = existeEnCliente || existeEnUser;

        // Si no existe, es válido
        if (!existe) return true;

        if (req.method === 'POST') {
            throw new Error(`El email ${trimmedEmail} ya está registrado`);
        }

        if (req.method === 'PUT') {
            const esMismoRegistro = existe._id.toString() === req.params.id;
            if (!esMismoRegistro) {
                throw new Error(`El email ${trimmedEmail} pertenece a otro usuario`);
            }
        }

        return true;
    },

    // ✅ Validación del número de teléfono
    validatePhone: (phone) => {
        if (!phone?.toString().trim()) throw new Error("El teléfono es requerido");

        const phoneStr = phone.toString().trim();

        // Validación básica de número de teléfono con o sin símbolos
        if (!/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(phoneStr)) {
            throw new Error("Formato de teléfono no válido");
        }

        return true;
    },

    // ✅ Validación de la dirección
    validateAddress: (address) => {
        if (!address?.trim()) throw new Error("La dirección es requerida");

        const trimmedAddress = address.trim();

        // Debe tener entre 10 y 200 caracteres
        if (trimmedAddress.length < 10 || trimmedAddress.length > 200) {
            throw new Error("La dirección debe tener entre 10 y 200 caracteres");
        }

        return true;
    },

    // ✅ Verificación de existencia de cliente por documento
    existCustomer: async (document, { req }) => {
        try {
            const docNumber = Number(document);

            // Validación básica del número
            if (isNaN(docNumber)) {
                throw new Error("Número de documento inválido.");
            }

            // Buscar el cliente por documento
            const customer = await Cliente.findOne({ document: docNumber });

            // Si no se encuentra, se lanza error
            if (!customer) {
                throw new Error(`No se encontró un cliente con el documento: ${docNumber}`);
            }

            // Guardar el cliente en req para acceder desde el controlador
            req.customerDB = customer;

            return true;

        } catch (error) {
            throw new Error(`Error al verificar el cliente: ${error.message}`);
        }
    }
};






