import nodemailer from 'nodemailer';
import { config } from '../config/config.js';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASS
  }
});

export const sendRegistrationEmail = async (userEmail, userName) => {
  const mailOptions = {
    from: config.EMAIL_USER,
    to: userEmail,
    subject: 'errezeta SHOP - Bienvenido a nuestra tienda en línea',
    html: `
      <h1>Bienvenido, ${userName}!</h1>
      <p>Gracias por registrarte en nuestra tienda en línea. Esperamos que disfrutes de tu experiencia de compra.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Correo de registro enviado con éxito');
  } catch (error) {
    console.error('Error al enviar correo de registro:', error);
    throw error;
  }
};

export const sendTicketEmail = async (userEmail, ticket) => {

  const generateProductList = (products) => {
    if (!Array.isArray(products) || products.length === 0) {
      return '<li>No hay productos disponibles</li>';
    }

    return products.map(item => {
      const product = item.product;
      const quantity = item.quantity || 1;
      const name = product.title || 'Producto sin nombre';
      const price = product.price ? `$${product.price.toFixed(2)}` : 'Precio no disponible';
      return `<li>${quantity} x ${name} - ${price}</li>`;
    }).join('');
  };

  const mailOptions = {
    from: config.EMAIL_USER,
    to: userEmail,
    subject: 'errezeta SHOP - Confirmación de compra',
    html: `
      <h1>Gracias por tu compra</h1>
      <p>Tu ticket de compra:</p>
      <ul>
        <li>Código: ${ticket.code}</li>
        <li>Fecha: ${new Date(ticket.purchase_datetime).toLocaleString()}</li>
        <li>Total: $${ticket.amount.toFixed(2)}</li>
      </ul>
      <p>Productos comprados:</p>
      <ul>
        ${generateProductList(ticket.products)}
      </ul>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Correo de ticket enviado con éxito');
  } catch (error) {
    console.error('Error al enviar correo de ticket:', error);
    throw error;
  }
};
