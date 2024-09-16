import multer from 'multer';
import {__dirname} from './dirname.js';
import path from 'path';

const getDestinationFolder = (file) => {
    if (file.fieldname === 'profile') {
        return 'profiles';
    } else if (file.fieldname === 'product') {
        return 'products';
    } else if (file.fieldname === 'document') {
        return 'documents';
    }
    return 'others';
};

const storage = multer.diskStorage({
    destination: function (request, file, callback) {
        const folder = getDestinationFolder(file);
        const uploadPath = path.join(__dirname, `/public/uploads/${folder}`);
        callback(null, uploadPath);
    },
    filename: function (request, file, callback) {
        callback(null, `${Date.now()}-${file.originalname}`);
    }
});

export const uploader = multer({
    storage
})