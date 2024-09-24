import { Server } from 'socket.io';
import { daoFactory } from '../factories/factory.js';
import { getUploadsPath } from '../utils/dirname.js';
import path from 'path';

let io;
let productManager;
let messageManager;

export async function initializeSocket(server) {
  io = new Server(server);
  const { ProductDao, MessageDao } = await daoFactory.initializeDaos();
  productManager = ProductDao;
  messageManager = MessageDao;

  io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');

    // Enviar la lista de productos al cliente cuando se conecta
    productManager.getAllProducts().then((result) => {
      const products = result.docs || result;
      if (Array.isArray(products)) {
        const productsWithImagePaths = products.map(product => {
          const productObj = product.toObject ? product.toObject() : product;
          return {
            ...productObj,
            _id: productObj._id.toString(),
            image: productObj.image ? `/uploads/products/${productObj.image}` : '/uploads/products/default-product.jpg'
          };
        });
        socket.emit('updateProducts', productsWithImagePaths);
      } else {
        console.error('Error: products no es un array', products);
      }
    }).catch(error => {
      console.error('Error al obtener los productos:', error);
    });

    // Manejar la creación de un nuevo producto
    socket.on('newProduct', async (productData) => {
      try {
        const newProduct = await productManager.addProduct(productData);
        const productObj = newProduct.toObject ? newProduct.toObject() : newProduct;
        io.emit('productAdded', {
          ...productObj,
          _id: productObj._id.toString(),
          image: productObj.image ? `/uploads/products/${productObj.image}` : '/uploads/products/default-product.jpg'
        });
      } catch (error) {
        console.error('Error al agregar producto:', error);
        socket.emit('productError', { message: 'Error al agregar producto' });
      }
    });

    // Manejar la eliminación de un producto
    socket.on('deleteProduct', async (productId) => {
      try {
        await productManager.deleteProduct(productId);
        io.emit('productDeleted', productId);
      } catch (error) {
        console.error('Error al eliminar producto:', error);
        socket.emit('productError', { message: 'Error al eliminar producto' });
      }
    });

    // Manejar el envío de mensajes
    socket.on('chatMessage', async (messageData) => {
      try {
        const newMessage = await messageManager.addMessage(messageData);
        io.emit('message', newMessage);
      } catch (error) {
        console.error('Error al agregar mensaje:', error);
        socket.emit('messageError', { message: 'Error al agregar mensaje' });
      }
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.IO no ha sido inicializado. Llama a initializeSocket primero.');
  }
  return io;
}
