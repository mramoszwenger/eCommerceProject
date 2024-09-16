const createUserDTO = (newUser) => ({
  id: newUser._id,
  name: newUser.name,
  email: newUser.email
});

export default createUserDTO;
