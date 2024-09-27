export const toPlainObject = (doc) => {
  return doc ? doc.toObject({ getters: true }) : null;
};

export const handlebarsHelpers = {
  toPlainObject,
  eq: (v1, v2) => v1 === v2,
  ne: (v1, v2) => v1 !== v2,
  lt: (v1, v2) => v1 < v2,
  gt: (v1, v2) => v1 > v2,
  lte: (v1, v2) => v1 <= v2,
  gte: (v1, v2) => v1 >= v2,
  and() {
    return Array.prototype.every.call(arguments, Boolean);
  },
  or() {
    return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
  },
  
  multiply: (a, b) => a * b,
  
  calculateTotal: (products) => {
    return products.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  },

  formatDate: (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
};
