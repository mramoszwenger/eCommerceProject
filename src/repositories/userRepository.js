import UserDTO from '../dtos/userDTO.js';

const UserRepository = (dao) => {
  const repo = {};

  repo.addUser = async (userData) => {
    const user = await dao.addUser(userData);
    return new UserDTO(user);
  };

  repo.validateUser = async (email, password) => {
    const user = await dao.validateUser(email, password);
    return user ? new UserDTO(user) : null;
  };

  repo.getAllUsers = async () => {
    const users = await dao.getAllUsers();
    return users.map(user => new UserDTO(user));
  };

  repo.getUserById = async (id) => {
    const user = await dao.getUserById(id);
    return user ? new UserDTO(user) : null;
  };

  repo.updateUser = async (id, userData) => {
    const updatedUser = await dao.updateUser(id, userData);
    return new UserDTO(updatedUser);
  };

  repo.deleteUser = async (id) => {
    const deletedUser = await dao.deleteUser(id);
    return deletedUser ? new UserDTO(deletedUser) : null;
  };

  return repo;
};

export default UserRepository;