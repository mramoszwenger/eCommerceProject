import bcrypt from 'bcrypt';

export const createHash = passport => bcrypt.hashSync(passport, bcrypt.genSaltSync(10));
export const isValidPassword = (user, password) => bcrypt.compareSync(password, user.password);