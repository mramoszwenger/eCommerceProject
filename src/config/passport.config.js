import passport from 'passport';
import {Strategy, ExtractJwt} from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GitHubStrategy } from 'passport-github2';
import UserManagerMongo from '../daos/mongo/usersDaoMongo.js';
import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, JWT_SECRET } from './config.js';

const userService = new UserManagerMongo();

const JWTStrategy = Strategy;
const ExtractJWT  = ExtractJwt;

export const initializePassport = () => {
  const cookieExtractor = request => {
    let token = null
    if (request?.cookies) {
        token = request.cookies['token']
    }
    return token
  }

  // Registro de usuario
  passport.use('register', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  }, async (request, email, password, done) => {
    try {
      const { first_name, last_name, age } = request.body;
      const user = await userService.createUser({ first_name, last_name, age, email, password });
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));

  passport.use('jwt', new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
    secretOrKey: JWT_SECRET
  }, async (jwt_payload, done) => {
      try {
        const user = await userService.getUserBy({ _id: jwt_payload.id });
        if (!user) {
          return done(null, false, { message: 'No se encontro usuario' });
        }  
        return done(null, jwt_payload);
      } catch (error) {
          return done(error);
      }
  }));

  // Login
  passport.use('login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, async (email, password, done) => {
    try {
      const user = await userService.authenticateUser(email, password);
      if (!user) {
        return done(null, false, { message: 'Correo o contraseña incorrecta' });
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));

  passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
//    clientID: 'Iv23lifig732UoB8lvLJ',
//    clientSecret: 'eb7fecf77b37d6f89eb9ef32092081f163b25429',
    callbackURL: 'http://localhost:8080/api/sessions/githubcallback'
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await userService.getUserBy({ email: profile._json.email });
      if (!user) {
        user = await userService.createUser({
          first_name: profile._json.name,
          last_name: profile._json.name,
          email: profile._json.email,
          password: ''
        });
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));

  // Serializar usuario en la sesión
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  // Deserializar usuario en la sesión
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await userService.getUserBy({ _id: id });
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
};

export default passport;