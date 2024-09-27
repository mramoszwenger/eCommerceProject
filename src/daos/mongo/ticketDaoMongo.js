import Ticket from '../../models/ticketModel.js';
import { v4 as uuidv4 } from 'uuid';

class TicketDaoMongo {
  generateUniqueCode = async () => {
    let isUnique = false;
    let code;
    while (!isUnique) {
      code = uuidv4();
      const existingTicket = await Ticket.findOne({ code });
      if (!existingTicket) {
        isUnique = true;
      }
    }
    return code;
  }

  createTicket = async (ticketData) => {
    try {
      const ticket = new Ticket({
        ...ticketData,
        code: ticketData.code || await this.generateUniqueCode(),
        purchase_datetime: new Date()
      });
      return await ticket.save();
    } catch (error) {
      console.error('Error al crear el ticket:', error);
      return null;
    }
  }

  getTicketById = async (id) => {
    try {
      return await Ticket.findById(id).populate('products.product');
    } catch (error) {
      console.error('Error al obtener el ticket:', error);
      return null;
    }
  }

  getTicketByCode = async (code) => {
    try {
      return await Ticket.findOne({ code }).populate('products.product');
    } catch (error) {
      console.error('Error al obtener el ticket por código:', error);
      return null;
    }
  }

  getAllTickets = async () => {
    try {
      return await Ticket.find().populate('products.product');
    } catch (error) {
      console.error('Error al obtener todos los tickets:', error);
      return [];
    }
  }

  updateTicket = async (id, updateData) => {
    try {
      return await Ticket.findByIdAndUpdate(id, updateData, { new: true }).populate('products.product');
    } catch (error) {
      console.error('Error al actualizar el ticket:', error);
      return null;
    }
  }

  deleteTicket = async (id) => {
    try {
      const result = await Ticket.findByIdAndDelete(id);
      return result ? true : false;
    } catch (error) {
      console.error('Error al eliminar el ticket:', error);
      return false;
    }
  }

  getTicketsByUserId = async (userId) => {
    try {
      return await Ticket.find({ purchaser: userId })
        .sort({ purchase_datetime: -1 })
        .populate('products.product');
    } catch (error) {
      console.error('Error al obtener tickets por userId:', error);
      return [];
    }
  }
}

export default TicketDaoMongo;
