import fs from 'node:fs';
import { v4 as uuidv4 } from 'uuid';
import { getDataFilePath } from '../../utils/dirname.js';

class TicketDaoFS {
  constructor() {
    this.path = getDataFilePath('tickets.json');
  }

  getAllTickets = async () => {
    try {
      if (!fs.existsSync(this.path)) {
        await fs.promises.writeFile(this.path, '[]');
        return [];
      }
      const data = await fs.promises.readFile(this.path, 'utf-8');
      return data.trim() ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error al obtener los tickets:', error);
      return [];
    }
  }

  generateUniqueCode = async () => {
    const tickets = await this.getAllTickets();
    let code;
    do {
      code = uuidv4();
    } while (tickets.some(ticket => ticket.code === code));
    return code;
  }

  createTicket = async (ticketData) => {
    try {
      const tickets = await this.getAllTickets();
      const tid = Date.now().toString();
      const code = await this.generateUniqueCode();
      const newTicket = {
        tid,
        code,
        purchase_datetime: new Date(),
        ...ticketData
      };
      tickets.push(newTicket);
      await fs.promises.writeFile(this.path, JSON.stringify(tickets, null, 2));
      return newTicket;
    } catch (error) {
      console.error('Error al crear el ticket:', error);
      return null;
    }
  }

  getTicketById = async (tid) => {
    try {
      const tickets = await this.getAllTickets();
      return tickets.find(ticket => ticket.tid === tid) || null;
    } catch (error) {
      console.error('Error al obtener el ticket:', error);
      return null;
    }
  }

  getTicketByCode = async (code) => {
    try {
      const tickets = await this.getAllTickets();
      return tickets.find(ticket => ticket.code === code) || null;
    } catch (error) {
      console.error('Error al obtener el ticket por código:', error);
      return null;
    }
  }

  updateTicket = async (tid, updateData) => {
    try {
      const tickets = await this.getAllTickets();
      const index = tickets.findIndex(ticket => ticket.tid === tid);
      if (index !== -1) {
        tickets[index] = { ...tickets[index], ...updateData };
        await fs.promises.writeFile(this.path, JSON.stringify(tickets, null, 2));
        return tickets[index];
      }
      return null;
    } catch (error) {
      console.error('Error al actualizar el ticket:', error);
      return null;
    }
  }

  deleteTicket = async (tid) => {
    try {
      const tickets = await this.getAllTickets();
      const filteredTickets = tickets.filter(ticket => ticket.tid !== tid);
      if (tickets.length !== filteredTickets.length) {
        await fs.promises.writeFile(this.path, JSON.stringify(filteredTickets, null, 2));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error al eliminar el ticket:', error);
      return false;
    }
  }

  getTicketsByUserId = async (userId) => {
    try {
      const tickets = await this.getAllTickets();
      return tickets.filter(ticket => ticket.purchaser === userId)
                    .sort((a, b) => new Date(b.purchase_datetime) - new Date(a.purchase_datetime));
    } catch (error) {
      console.error('Error al obtener tickets por userId:', error);
      return [];
    }
  }
}

export default TicketDaoFS;
