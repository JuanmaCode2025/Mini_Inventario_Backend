import express from 'express';
import { createUsers, login } from '../controllers/user.js';
import { check} from 'express-validator';
import  { validarCampos } from '../middlewares/validarcampos.js'
import { UserHelpers,loginHelpers } from '../helpers/user.js';


const router = express.Router();

router.post(
    '/create',
    [
        check('document').custom(UserHelpers.validarDocumento),
        check('name').custom(UserHelpers.validarNombre),
        check('email').custom(UserHelpers.validarEmail),
        check('password').custom(UserHelpers.validarPassword),
        validarCampos
    ],
    createUsers
);

router.post(
    '/login',
    [
        check('email', 'El email es requerido').not().isEmpty(),
        check('email').custom(loginHelpers.validarEmailLogin),
        check('password', 'La contraseña es requerida').not().isEmpty(),
        check('password').custom(loginHelpers.validarPasswordLogin),
        validarCampos
    ],
    login
);


// 🔧 Exportar el router para poder importarlo desde app.js
export default router;
