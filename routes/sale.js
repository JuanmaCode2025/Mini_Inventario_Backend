import express from 'express';
import { check, param } from 'express-validator';
import { validarCampos } from '../middlewares/validarcampos.js';
import { 
    registerSale, 
    listSales, 
    getSale, 
    getSalesByClient, 
    getSalesByProduct 
} from '../controllers/sale.js';
import { SaleValidators } from '../helpers/sale.js';

const router = express.Router();

// Registrar Venta
router.post('/register',
    [
        check('document').custom(SaleValidators.validateDocument),
        check('products.*.barcode').custom(SaleValidators.validateBarcode),
        check('products.*.cantidad').custom(SaleValidators.validateQuantity),
        check('metodoPago').custom(SaleValidators.validatePaymentMethod),
        validarCampos
    ],
    registerSale
);

// Listar Ventas
router.get('/listsales', listSales);

// Obtener Venta
router.get('/salesearch/:id',
    [
        check('id').isMongoId().withMessage('ID inválido'),
        param('id').custom(SaleValidators.validateSaleExist)
    ],
    validarCampos,
    getSale
);



// Ventas por Cliente
router.get('/cliente/:document',
    [
         check('document').custom(SaleValidators.validateDocument),
    ], validarCampos,
    getSalesByClient);

// Ventas por Producto
router.get('/saleproduct/:barcode',
    [
        check('desde').optional().custom(SaleValidators.validateDateRange),
        check('hasta').optional().custom(SaleValidators.validateDateRange),
        validarCampos
    ],
    getSalesByProduct
);

export default router;