import express from "express";
import { cargarArchivoCloud, mostrarImagenCloud } from "../controllers/uploadController.js";

const router = express.Router();

router.post("/upload/:id", cargarArchivoCloud);
router.get("/upload/:id", mostrarImagenCloud);

export default router;
