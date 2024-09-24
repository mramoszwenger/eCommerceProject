import { promises as fs } from 'fs';
import { createHash } from 'crypto';
import { config } from '../../config/config.js';

class UserManager {
  constructor() {
    this.path = config.USERS_FILE_PATH;
  }

  init = async () => {
    try {
      await this.readFile();
    } catch (error) {
      console.error('Error al inicializar UserManager:', error.message);
      await this.writeFile([]);
    }
  }

  hashPassword = (password) => {
    return createHash('sha256').update(password).digest('hex');
  }

  addUser = async ({ username, firstName, lastName, email, password }) => {
    const users = await this.readFile();

    const existingUser = users.find(user => user.username === username || user.email === email);
    if (existingUser) {
      throw new Error('El nombre de usuario o email ya está registrado');
    }

    const newUser = {
      id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
      username,
      firstName,
      lastName,
      email,
      password: this.hashPassword(password)
    };

    users.push(newUser);
    await this.writeFile(users);
    
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  validateUser = async (email, password) => {
    const users = await this.readFile();

    const user = users.find(user => user.email === email);
    if (!user) {
      return null;
    }

    const hashedPassword = this.hashPassword(password);
    if (user.password !== hashedPassword) {
      return null;
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  getAllUsers = async () => {
    const users = await this.readFile();
    return users.map(({ password, ...user }) => user);
  }

  getUserById = async (id) => {
    const users = await this.readFile();
    const user = users.find(user => user.id === id);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  updateUser = async (id, userData) => {
    const users = await this.readFile();
    const index = users.findIndex(user => user.id === id);
    if (index === -1) {
      throw new Error('Usuario no encontrado');
    }

    const updatedUser = { ...users[index], ...userData };
    if (userData.password) {
      updatedUser.password = this.hashPassword(userData.password);
    }

    users[index] = updatedUser;
    await this.writeFile(users);

    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  deleteUser = async (id) => {
    const users = await this.readFile();
    const index = users.findIndex(user => user.id === id);
    if (index === -1) {
      throw new Error('Usuario no encontrado');
    }

    const deletedUser = users.splice(index, 1)[0];
    await this.writeFile(users);

    const { password, ...userWithoutPassword } = deletedUser;
    return userWithoutPassword;
  }

  readFile = async () => {
    try {
      const data = await fs.readFile(this.path, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw new Error('Error al leer el archivo de usuarios');
    }
  }

  writeFile = async (data) => {
    try {
      await fs.writeFile(this.path, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      throw new Error('Error al guardar el archivo de usuarios');
    }
  }
}

export default UserManager;
