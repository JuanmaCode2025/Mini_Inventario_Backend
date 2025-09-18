import express from 'express';
import {
    create_product,
    Productlist,
    buscar_producto,
    product_edit,
    putActivarProducto,
    putDesactivarProducto,
    delete_producto
} from '../controllers/product.js';
import { validarJWT } from '../middlewares/token.js';
import { validarCampos } from '../middlewares/validarcampos.js';
import { ProductHelpers } from '../helpers/product.js';
import { check } from 'express-validator';

const router = express.Router();


router.put("activarProducto/:id", [
    validarJWT,
    [
        check("id").isMongoId(),
        validarCampos
    ],
    putActivarProducto
]);

router.put("desactivarProducto/:id", [
    validarJWT,
    [
        check("id").isMongoId(),
        validarCampos
    ],
    putDesactivarProducto
]);


router.post('/createproduct',
    validarJWT,
    [
        check('barcode').custom(ProductHelpers.validateBarcode),
        check('name').custom(ProductHelpers.validateName),
        check('details').custom(ProductHelpers.validateDetails),
        check('category').custom(ProductHelpers.validateCategory),
        check('price').custom(ProductHelpers.validatePrice),
        check('stock').custom(ProductHelpers.validateStock),
        validarCampos
    ],
    create_product
);

router.get('/listar',
    validarJWT,
    Productlist
);

router.get('/obtener/:barcode',
    validarJWT,
    [
        check('barcode').custom(ProductHelpers.existProductByBarcode),
        validarCampos
    ],
    buscar_producto
);

router.put('/edit/:id',
    validarJWT,
    [   check('id').isMongoId().withMessage("ID de producto inválido"),
        check('barcode').custom(ProductHelpers.existProductByBarcode),
        check('name').optional().custom(ProductHelpers.validateName),
        check('category').optional().custom(ProductHelpers.validateCategory),
        check('price').optional().custom(ProductHelpers.validatePrice),
        check('stock').optional().custom(ProductHelpers.validateStock),
        validarCampos
    ],
    product_edit
);

router.delete('/eliminar/:barcode',
    // validarJWT,
    [
        check('barcode').custom(ProductHelpers.existProductByBarcode),
        validarCampos
    ],
    delete_producto
);

export default router;