import multer from 'multer';
import path from 'path';
import { getPublicPath } from '../utils/dirname.js';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(getPublicPath(), 'uploads', 'products'))
  },
  filename: function (req, file, cb) {
    // Obtener la extensión del archivo original
    const ext = path.extname(file.originalname);
    // Obtener el nombre del archivo sin la extensión
    const name = path.basename(file.originalname, ext);
    // Crear el nuevo nombre del archivo
    const newFilename = `${Date.now()}-${name}${ext}`;
    cb(null, newFilename);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('No es una imagen válida'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // límite de 5MB
  }
});

export const uploadMiddleware = (req, res, next) => {
  upload.single('image')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'El archivo es demasiado grande. El tamaño máximo es 5MB.' });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      console.error('Unknown error:', err);
      return res.status(500).json({ error: err.message });
    }
    
    if (req.file) {
      console.log('Imagen subida:', req.file.filename);
    } else {
      console.log('No se subió ninguna imagen');
    }
    
    next();
  });
};

export default uploadMiddleware;
