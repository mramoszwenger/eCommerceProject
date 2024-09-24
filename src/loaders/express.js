import express from 'express';
import handlebars from 'express-handlebars';
import path from 'path';
import { config } from '../config/config.js';
import { getPublicPath, getUploadsPath } from '../utils/dirname.js';
import { handlebarsHelpers } from '../utils/handlebarsHelpers.js';

export default (app) => {
  // Middleware para parsear JSON y datos de formularios
  app.use(express.json());
  app.use(express.urlencoded({extended: true}));

  // Configuración de Handlebars
  app.engine('hbs', handlebars.engine({ 
    extname: '.hbs',
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true
    },
    helpers: handlebarsHelpers
  }));
  app.set('view engine', 'hbs');
  
  const viewsPath = path.join(getPublicPath(), '../views');
  app.set('views', viewsPath);

  // Middleware para servir archivos estáticos
  app.use(express.static(getPublicPath()));

  // Middleware específico para la carpeta de uploads
  app.use('/uploads', express.static(getUploadsPath()));

  return app;
};
