import { PERSISTENCE } from "../config/config.js";

export let ProductsDao;
export let CartsDao;
export let UsersDao;

const initializeDaos = async () => {
    switch (PERSISTENCE) {

        case "MEMORY":
            // Implementar DAOs en memoria.
            break;

        case "FS":
            const { default: ProductDaoFS } = await import('../daos/fs/productsManagerFS.js');
            ProductsDao = ProductDaoFS;
            break;

        default:
            // MONGO
            const { connectDB } = await import("../config/config.js");
            await connectDB();

            const { default: ProductManagerMongo } = await import("../daos/mongo/productsDaoMongo.js");
            const { default: CartManagerMongo } = await import("../daos/mongo/cartsDaoMongo.js");
            const { default: UserManagerMongo } = await import("../daos/mongo/usersDaoMongo.js");

            ProductsDao = new ProductManagerMongo;
            CartsDao = new CartManagerMongo;
            UsersDao = new UserManagerMongo;
            break;
    }
};

export default initializeDaos;