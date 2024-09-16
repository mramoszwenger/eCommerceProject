import { getServices, initializeServices, areServicesInitialized } from '../services/service.js';

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
    const options = { limit: 5, page: 1, sort: { createdAt: -1 } };

    if (!areServicesInitialized()) {
        console.log('Servicios no inicializados. Inicializando...');
        await initializeServices();
    }

    const { productService } = getServices();

    io.on('connection', (socket) => {
        console.log('Cliente conectado al socket');

        socket.on('getProducts', async () => {
            try {
                console.log('Solicitando productos con opciones:', options);
                const result = await productService.getAllProducts({}, options);
                console.log('Productos obtenidos:', result);
                if (result && result.docs) {
                    socket.emit('products', result.docs);
                } else {
                    throw new Error('Resultado de productos inválido');
                }
            } catch (error) {
                console.error('Error al obtener productos:', error);
                socket.emit('error', 'No se pudo obtener la lista de productos.');
            }
        });

        socket.on('addProduct', async (data) => {
            try {
                const product = await productService.createProduct(data);
                if (product) {
                    const result = await productService.getAllProducts({}, options);
                    if (result && result.docs) {
                        io.sockets.emit('products', result.docs);
                    } else {
                        throw new Error('Resultado de productos inválido después de agregar');
                    }
                }
            } catch (error) {
                console.error('Error al agregar producto:', error);
                io.sockets.emit('error', 'No se pudo agregar el producto.');
            }
        });
    });
};

export { initChatSocket, initProductsSocket };
