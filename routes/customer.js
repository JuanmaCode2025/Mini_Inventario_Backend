import express from 'express'
import { createCustomer, listCustomers, getCustomer, updateCustomer, putDesactivarCustomer, putActivarCustomer, deleteCustomer } from '../controllers/customer.js'
import { validarJWT } from '../middlewares/token.js'
import { check } from 'express-validator';
import { validarCampos } from '../middlewares/validarcampos.js';
import { customerHelpers } from '../helpers/customer.js';

//import { RecommendationEngine } from '../helpers/recommendationHelper.js';
import { recomendar } from '../api.js';
//anrere

const router = express.Router();


router.get('/reconmedar',
    recomendar
);

router.put("/activarCustomer/:id",
    validarJWT,
    [
        check("id").isMongoId(),
        validarCampos
    ],
    putActivarCustomer
);

router.put("/desactivarCustomer/:id",
    validarJWT,
    [
        check("id").isMongoId(),
        validarCampos
    ],
    putDesactivarCustomer
);


// Crear cliente
router.post('/createcustomer',
    validarJWT,
    [
        check('document', 'El documento es requerido').not().isEmpty(),
        check('document').custom(customerHelpers.validateDocument),
        check('name', 'El nombre es requerido').not().isEmpty(),
        check('name').custom(customerHelpers.validateName),
        check('email', 'El email es requerido').not().isEmpty(),
        check('email').custom(customerHelpers.validateEmail),
        check('phone', 'El teléfono es requerido').not().isEmpty(),
        check('phone').custom(customerHelpers.validatePhone),
        check('address', 'La dirección es requerida').not().isEmpty(),
        check('address').custom(customerHelpers.validateAddress),
        validarCampos
    ],
    createCustomer
);

// Listar clientes (con paginación)
router.get('/lista/listcustomer',
    validarJWT,
    listCustomers
);

// Obtener cliente por ID
router.get('/getcustomer/:document',  // Cambiado de :id a :document para coincidir con el helper
    validarJWT,
    [
        check('document').custom(customerHelpers.existCustomer),
        validarCampos
    ],
    getCustomer
);

// Actualizar cliente
router.put('/putcustomer/:id',
    validarJWT,
    [
        check('id')
            .isMongoId()
            .withMessage('ID no válido'),
        check('document')
            .optional()
            .custom(customerHelpers.validateDocument),
        check('name')
            .optional()
            .custom(customerHelpers.validateName),
        check('email')
            .optional()
            .custom(customerHelpers.validateEmail),
        check('phone')
            .optional()
            .custom(customerHelpers.validatePhone),
        check('address')
            .optional()
            .custom(customerHelpers.validateAddress),
        validarCampos
    ],
    updateCustomer
);


// Eliminar cliente por documento (soft delete)
router.delete('/delete/:document',
    // validarJWT,
    [
        check('document').custom(customerHelpers.existCustomer),
        validarCampos
    ],
    deleteCustomer
);




export default router;