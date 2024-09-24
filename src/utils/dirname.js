import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

export const getDataFilePath = (filename) => join(__dirname, '../../data', filename);
export const getPublicPath = () => join(__dirname, '../../public');
export const getUploadsPath = () => join(getPublicPath(), 'uploads');