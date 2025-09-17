import { v2 as cloudinary } from "cloudinary";
import Producto from "../models/producto.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
  secure: true
});

export const cargarArchivoCloud = async (req, res) => {
  const { id } = req.params;

  try {
    // archivo enviado desde frontend
    const { tempFilePath } = req.files.archivo;

    // subir a Cloudinary
    const result = await cloudinary.uploader.upload(tempFilePath, {
      width: 250,
      crop: "limit"
    });

    // buscar el documento
    let product = await Producto.findById(id);

    // si ya tenía imagen, eliminarla de Cloudinary
    if (product.photo) {
      const nombreTemp = product.photo.split("/");
      const nombreArchivo = nombreTemp[nombreTemp.length - 1];
      const [public_id] = nombreArchivo.split(".");
      await cloudinary.uploader.destroy(public_id);
    }

    // actualizar en la BD
    product = await Producto.findByIdAndUpdate(id, { photo: result.secure_url });

    res.json({ url: result.secure_url });

  } catch (error) {
    console.error(error);
    res.status(400).json({ error, msg: "Error al cargar a Cloudinary" });
  }
};

export const mostrarImagenCloud = async (req, res) => {
  const { id } = req.params;

  try {
    const holder = await Holder.findById(id);

    if (holder.photo) {
      return res.json({ url: holder.photo });
    }

    res.status(400).json({ msg: "Falta Imagen" });

  } catch (error) {
    res.status(400).json({ error, msg: "Error al mostrar imagen" });
  }
};
