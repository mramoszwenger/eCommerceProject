import { User } from '../../models/userModel.js';
import bcrypt from 'bcrypt';

class UserDaoMongo {
  init = async () => {}

  addUser = async ({ username, firstName, lastName, email, password }) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      firstName,
      lastName,
      email,
      password: hashedPassword
    });
    await newUser.save();
    const { password: _, ...userWithoutPassword } = newUser.toObject();
    return userWithoutPassword;
  }

  validateUser = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) return null;
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;
    const { password: _, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  }

  getAllUsers = async () => {
    const users = await User.find({}, '-password');
    return users;
  }

  getUserById = async (id) => {
    const user = await User.findById(id, '-password');
    if (!user) throw new Error('Usuario no encontrado');
    return user;
  }

  updateUser = async (id, userData) => {
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    const updatedUser = await User.findByIdAndUpdate(id, userData, { new: true, select: '-password' });
    if (!updatedUser) throw new Error('Usuario no encontrado');
    return updatedUser;
  }

  deleteUser = async (id) => {
    const deletedUser = await User.findByIdAndDelete(id, { select: '-password' });
    if (!deletedUser) throw new Error('Usuario no encontrado');
    return deletedUser;
  }

  findOne = async (criteria) => {
    const user = await User.findOne(criteria);
    if (!user) return null;
    const { password: _, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  }
}

export default UserDaoMongo;
