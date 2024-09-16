import { ticketModel } from '../../models/ticket.model.js';

export default class TicketManager{
    constructor(){
        this.ticketsModel = ticketsModel;
    }

    getTickets = async () => {
        try {
            return await ticketModel.find().lean()
        } catch (error) {
            console.log(error)
        }
    }
    getTicketById = async (ticketId) => {
        try {
            return await ticketModel.findById(ticketId).lean()
        } catch (error) {
            console.log(error)
        }
    }

    addTicket = async (ticketData) => {
        try {
            return await ticketModel.create(ticketData);
        } catch (error) {
            console.log(error)
        }
    }

    updateTicket = async (idTicket, ticket) => {
        try{
            return await ticketModel.updateOne({ _id: idTicket } , ticket)
        }catch(error){
            console.log(error);
        }
    }
    
    deleteTicket = async (idTicket) => {
        try{
            return await ticketModel.deleteOne({_id: idTicket})
        }catch (error) {
            console.log(error)
        }
    }
}