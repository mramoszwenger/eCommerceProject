import TicketRepository from '../repositories/ticketRepository.js';
import { daoFactory } from '../factories/factory.js';
import { formatDate, formatPrice } from '../utils/formatters.js';
import { sendTicketEmail } from '../services/emailServices.js';

class TicketController {
	constructor() {
		this.ticketRepository = null;
		this.cartManager = null;
		this.productManager = null;
	}

	initialize = async () => {
		const { TicketDao, CartDao, ProductDao } = await daoFactory.initializeDaos();
		this.ticketRepository = TicketRepository(TicketDao, CartDao, ProductDao);
		this.cartManager = CartDao;
		this.productManager = ProductDao;
	}

	createTicket = async (request, response) => {
		try {
			const { cid } = request.params;
			console.log('ID del carrito recibido:', cid);
			const userEmail = request.session.user.email;
			console.log('Email del usuario:', userEmail);

			const { ticket, failedProducts } = await this.ticketRepository.processTicket(cid, userEmail);

			console.log('Ticket creado:', ticket);
			console.log('Productos fallidos:', failedProducts);

			// Enviar correo electrónico con los detalles del ticket
			try {
				await sendTicketEmail(userEmail, ticket);
				console.log('Correo de ticket enviado con éxito');
			} catch (emailError) {
				console.error('Error al enviar correo de ticket:', emailError);
			}

			response.status(201).json({
				status: 'success',
				message: 'Ticket creado exitosamente',
				ticket,
				failedProducts
			});
		} catch (error) {
			console.error('Error detallado al crear el ticket:', error);
			response.status(500).json({ status: 'error', message: error.message });
		}
	}

	getTicketById = async (request, response) => {
		try {
			const { id } = request.params;
			const ticket = await this.ticketRepository.getTicketById(id);

			if (!ticket) {
				return response.status(404).json({ status: 'error', message: 'Ticket no encontrado' });
			}

			response.json({ status: 'success', ticket });
		} catch (error) {
			console.error('Error al obtener el ticket:', error);
			response.status(500).json({ status: 'error', message: error.message });
		}
	}

	getAllTickets = async (request, response) => {
		try {
			const tickets = await this.ticketRepository.getAllTickets();
			response.json({ status: 'success', tickets });
		} catch (error) {
			console.error('Error al obtener los tickets:', error);
			response.status(500).json({ status: 'error', message: error.message });
		}
	}

	getTicketsByUser = async (request, response) => {
		try {
			const userEmail = request.session.user.email;
			const tickets = await this.ticketRepository.getTicketsByUser(userEmail);
			response.json({ status: 'success', tickets });
		} catch (error) {
			console.error('Error al obtener los tickets del usuario:', error);
			response.status(500).json({ status: 'error', message: error.message });
		}
	}

	renderTicketDetail = async (request, response) => {
		try {
			const { id } = request.params;
			const ticket = await this.ticketRepository.getTicketById(id);

			if (!ticket) {
				return response.status(404).render('error', { error: 'Ticket no encontrado' });
			}

			console.log('Ticket completo:', JSON.stringify(ticket, null, 2));
			console.log('Productos del ticket:', JSON.stringify(ticket.products, null, 2));

			response.render('ticketDetail', { 
				ticket, 
				failedProducts: [],
				helpers: {
					formatDate,
					formatPrice,
					multiply: (a, b) => a * b
				}
			});
		} catch (error) {
			console.error('Error al renderizar el detalle del ticket:', error);
			response.status(500).render('error', { error: 'Error al cargar el detalle del ticket' });
		}
	}
}

const ticketController = new TicketController();
await ticketController.initialize();
export default ticketController;
