import jwt from 'jsonwebtoken';
import User from '../models/user.js'; 

 export const generarJWT = (document) => {
    return new Promise((resolve, reject) => {
        const payload = { document };
        jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_TIME || '24h'
        }, (err, token) => {

            if (err) {
                console.log(err);
                reject("No se pudo generar el token")
            } else {
                resolve(token)
            }
        })
    })
}

 export const validarJWT = async (req, res, next) => {
    const token = req.header("x-token");
    if (!token) {
        return res.status(401).json({
            msg: "No hay token en la peticion"
        })
    }
    try {
        const { document } = jwt.verify(token, process.env.JWT_SECRET)
        let usuario = await User.findOne(document);
        if (!usuario) {
            return res.status(401).json({
                msg: "Token no válido "//- usuario no existe DB
            })
        }
        if (usuario.estado == 0) {
            return res.status(401).json({
                msg: "Token no válido " //- usuario con estado: false
            })
        }
        next();
    } catch (error) {
        res.status(401).json({
            msg: "Token no valido"
        })
    }
}



