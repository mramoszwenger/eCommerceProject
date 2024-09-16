import { getServices, initializeServices } from '../services/service.js';

const initChatSocket = (io) => {
    const mensajes = [];
    let connectedClients = [];

    io.on('connection', (socket) => {
        connectedClients.push(socket);
        console.log(`Cliente conectado. Total de clientes conectados: ${connectedClients.length}`);

        socket.on('message', (data) => {
            console.log('message', data);
            mensajes.push(data);
            io.emit('messageLogs', mensajes);
        });

        socket.on('authenticated', (data) => {
            socket.broadcast.emit('newUserConnected', data);
        });

        socket.on('disconnect', () => {
            connectedClients = connectedClients.filter((client) => client !== socket);
            console.log(`Cliente desconectado. Total de clientes conectados: ${connectedClients.length}`);
        });
    });
};

const initProductsSocket = async (io) => {
    const config = { limit: 5, page: 1, sort: 1 };

    await initializeServices(); // Confirmar que los servicios estén inicializados
    const { productService } = getServices();

    io.on('connection', (socket) => {
        console.log('Cliente conectado al socket');

        // Envía la lista de productos al conectar
        socket.on('getProducts', async () => {
            try {
                const result = await productService.getAllProducts(config);
                socket.emit('products', result.docs); // Envía la lista de productos al cliente
            } catch (error) {
                console.error('Error al obtener productos:', error);
                socket.emit('error', 'No se pudo obtener la lista de productos.');
            }
        });

        // Maneja el evento de nuevo producto agregado
        socket.on('addProduct', async (data) => {
            try {
                const product = await productService.createProduct(data);
                if (product) {
                    const result = await productService.getAllProducts(config);
                    io.sockets.emit('products', result.docs); // Actualiza la lista de productos en todos los clientes
                }
            } catch (error) {
                console.error('Error al agregar producto:', error);
                io.sockets.emit('error', 'No se pudo agregar el producto.');
            }
        });
    });
};

export { initChatSocket, initProductsSocket };
