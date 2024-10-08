import { config } from '../config/config.js';
import { connectDB } from '../config/database.js';

class DaoFactory {
  constructor() {
    this.ProductDao = null;
    this.CartDao = null;
    this.UserDao = null;
    this.MessageDao = null;
    this.TicketDao = null;
    this.initializationPromise = null;
  }

  initializeDaos = async () => {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = (async () => {
      if (this.ProductDao && this.CartDao && this.UserDao && this.MessageDao && this.TicketDao) {
        console.log('DAOs already initialized');
        return { 
          ProductDao: this.ProductDao, 
          CartDao: this.CartDao, 
          UserDao: this.UserDao,
          MessageDao: this.MessageDao,
          TicketDao: this.TicketDao
        };
      }

      if (config.PERSISTENCE === "MONGODB") {
        await connectDB();
      }

      switch (config.PERSISTENCE) {
        case "MEMORY": {
          // Implementar DAOs en memoria si lo llegamoramos a necesitar
          throw new Error('Persistence type MEMORY not implemented yet');
        }

        case "FILESYSTEM": {
          const { default: ProductManager } = await import('../daos/fs/productDaoFS.js');
          const { default: CartManager } = await import('../daos/fs/cartDaoFS.js');
          const { default: UserManager } = await import('../daos/fs/userDaoFS.js');
          const { default: TicketDaoFS } = await import('../daos/fs/ticketDaoFS.js');

          this.ProductDao = new ProductManager();
          this.CartDao = new CartManager();
          this.UserDao = new UserManager();
          this.TicketDao = new TicketDaoFS();
          break;
        }

        case "MONGODB": {
          const { default: ProductDaoMongo } = await import("../daos/mongo/productDaoMongo.js");
          const { default: CartDaoMongo } = await import("../daos/mongo/cartDaoMongo.js");
          const { default: UserDaoMongo } = await import("../daos/mongo/userDaoMongo.js");
          const { default: MessageDaoMongo } = await import("../daos/mongo/messageDaoMongo.js");
          const { default: TicketDaoMongo } = await import("../daos/mongo/ticketDaoMongo.js");

          this.ProductDao = new ProductDaoMongo();
          this.CartDao = new CartDaoMongo();
          this.UserDao = new UserDaoMongo();
          this.MessageDao = new MessageDaoMongo();
          this.TicketDao = new TicketDaoMongo();
          break;
        }

        default:
          throw new Error('Persistence type not recognized');
      }

      console.log('PERSISTENCE:', config.PERSISTENCE);
      console.log('DAOs initialized successfully');

      return { 
        ProductDao: this.ProductDao, 
        CartDao: this.CartDao, 
        UserDao: this.UserDao,
        MessageDao: this.MessageDao,
        TicketDao: this.TicketDao
      };
    })();

    return this.initializationPromise;
  }
}

const daoFactory = new DaoFactory();

export { daoFactory };
