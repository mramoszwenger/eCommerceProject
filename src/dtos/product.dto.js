const createProductDTO = (newProduct) => ({
  id: newProduct._id,
  name: newProduct.name,
  price: newProduct.price
});

export default createProductDTO;