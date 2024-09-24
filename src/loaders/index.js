import expressLoader from './express.js';

export default async (app) => {
  await expressLoader(app);
  console.log('Express Initialized');
};
