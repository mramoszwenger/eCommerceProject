export const formatDate = (date) => {
  return new Date(date).toLocaleString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatPrice = (price) => {
  if (price === undefined || price === null) {
    return '0.00';
  }
  return Number(price).toFixed(2);
};
