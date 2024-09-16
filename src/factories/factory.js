import { PERSISTENCE } from "../config/config.js";

class DaoFactory {
  constructor() {
    this.ProductsDao = null;
    this.CartsDao = null;
    this.UsersDao = null;
  }

  async initializeDaos() {
    switch (PERSISTENCE) {
      case "MEMORY": {
        // Implementar DAOs en memoria.
        break;
      }

      case "FS": {
        const { default: ProductDaoFS } = await import('../daos/fs/productsManagerFS.js');
        this.ProductsDao = ProductDaoFS;
        console.log('ProductsDao (FS):', this.ProductsDao);
        break;
      }

      default: {
        // MONGO
        const { connectDB } = await import("../config/config.js");
        connectDB();

        const { default: ProductManagerMongo } = await import("../daos/mongo/productsDaoMongo.js");
        const { default: CartManagerMongo } = await import("../daos/mongo/cartsDaoMongo.js");
        const { default: UserManagerMongo } = await import("../daos/mongo/usersDaoMongo.js");

        this.ProductsDao = new ProductManagerMongo();
        this.CartsDao = new CartManagerMongo();
        this.UsersDao = new UserManagerMongo();
        console.log('ProductsDao (Mongo):', this.ProductsDao);
        console.log('CartsDao (Mongo):', this.CartsDao);
        console.log('UsersDao (Mongo):', this.UsersDao);
        break;
      }
    }

    console.log('PERSISTENCE:', PERSISTENCE);
    return { ProductsDao: this.ProductsDao, CartsDao: this.CartsDao, UsersDao: this.UsersDao };
  }
}

const daoFactory = new DaoFactory();

export { daoFactory };