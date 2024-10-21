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

export const sendPasswordResetEmail = async (userEmail, resetUrl) => {
  const mailOptions = {
    from: config.EMAIL_USER,
    to: userEmail,
    subject: 'errezeta SHOP - Restablecimiento de Contraseña',
    html: `
      <h1>Restablecimiento de Contraseña</h1>
      <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente botón para continuar:</p>
      <a href="${resetUrl}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Restablecer Contraseña</a>
      <p>Este enlace expirará en 1 hora.</p>
      <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Correo de restablecimiento de contraseña enviado con éxito');
  } catch (error) {
    console.error('Error al enviar correo de restablecimiento de contraseña:', error);
    throw error;
  }
};
