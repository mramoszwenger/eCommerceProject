const createCartDTO = (newCart) => ({
  id: newCart._id,
  items: newCart.items
});

export default createCartDTO;