class TicketDTO {
  constructor(ticket) {
    this.id = ticket._id || ticket.id;
    this.code = ticket.code;
    this.purchase_datetime = ticket.purchase_datetime;
    this.amount = ticket.amount;
    this.purchaser = ticket.purchaser;
    this.products = ticket.products.map(item => ({
      product: {
        id: item.product._id || item.product.id,
        title: item.product.title,
        price: item.product.price
      },
      quantity: item.quantity
    }));
  }
}

export default TicketDTO;
