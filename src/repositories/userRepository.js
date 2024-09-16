class UserRepository {
  constructor(userDao) {
    this.userDAO = userDao;
  }

  async getUserById(id) {
    return this.userDAO.getUserById(id);
  }
}

export default UserRepository;