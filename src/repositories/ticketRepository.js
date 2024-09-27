import TicketDTO from '../dtos/ticketDTO.js';

const TicketRepository = (ticketDao, cartDao, productDao) => {
  const repository = {
    processTicket: async (cartId, userEmail) => {
      try {
        console.log('Iniciando procesamiento de ticket para el carrito:', cartId);
        const cart = await cartDao.getCart(cartId);
        if (!cart) {
          throw new Error('Carrito no encontrado');
        }
        console.log('Carrito obtenido:', cart);

        let totalAmount = 0;
        const successfulProducts = [];
        const failedProducts = [];

        for (const item of cart.products) {
          console.log('Procesando producto:', item.product);
          const product = await productDao.getProductById(item.product);
          console.log('Producto obtenido:', product);
          
          if (product && product.stock >= item.quantity) {
            console.log('Stock suficiente. Actualizando producto...');
            product.stock -= item.quantity;
            await productDao.updateProduct(product._id, { stock: product.stock });
            totalAmount += product.price * item.quantity;
            successfulProducts.push({ product: product._id, quantity: item.quantity });
            console.log('Producto procesado exitosamente');
          } else {
            console.log('Stock insuficiente o producto no encontrado');
            failedProducts.push(item.product);
          }
        }

        console.log('Productos exitosos:', successfulProducts);
        console.log('Productos fallidos:', failedProducts);

        if (successfulProducts.length === 0) {
          throw new Error('No se pudo procesar ningún producto');
        }

        const ticketData = {
          code: await ticketDao.generateUniqueCode(),
          purchase_datetime: new Date(),
          amount: totalAmount,
          purchaser: userEmail,
          products: successfulProducts
        };

        console.log('Creando ticket con datos:', ticketData);
        const createdTicket = await ticketDao.createTicket(ticketData);
        console.log('Ticket creado:', createdTicket);

        // Actualizar el carrito
        await cartDao.updateCart(cartId, { products: cart.products.filter(item => failedProducts.includes(item.product)) });

        return { 
          ticket: new TicketDTO(createdTicket), 
          failedProducts 
        };
      } catch (error) {
        console.error('Error detallado en processTicket:', error);
        throw error;
      }
    },

    getTicketById: async (id) => {
      try {
        let ticket = await ticketDao.getTicketById(id);
        if (ticket) {
          // Poblar los datos del producto
          const populatedProducts = await Promise.all(ticket.products.map(async (item) => {
            const product = await productDao.getProductById(item.product);
            return {
              ...item.toObject(),  // Convertir a objeto plano si es un documento de Mongoose
              product: product
            };
          }));
          ticket = ticket.toObject();  // Convertir el ticket a un objeto plano
          ticket.products = populatedProducts;
        }
        return ticket ? new TicketDTO(ticket) : null;
      } catch (error) {
        console.error('Error en getTicketById:', error);
        throw error;
      }
    },

    getAllTickets: async () => {
      try {
        const tickets = await ticketDao.getAllTickets();
        return tickets.map(ticket => new TicketDTO(ticket));
      } catch (error) {
        console.error('Error en getAllTickets:', error);
        throw error;
      }
    },

    getTicketsByUser: async (userEmail) => {
      try {
        const tickets = await ticketDao.getTicketsByUser(userEmail);
        return tickets.map(ticket => new TicketDTO(ticket));
      } catch (error) {
        console.error('Error en getTicketsByUser:', error);
        throw error;
      }
    }
  };

  return repository;
};

export default TicketRepository;
