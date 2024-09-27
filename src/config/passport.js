import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GitHubStrategy } from 'passport-github2';
import bcrypt from 'bcrypt';
import { User } from '../models/userModel.js';
import { config } from './config.js';

passport.use('local-register', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, email, password, done) => {
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return done(null, false, { message: 'El email ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email,
      password: hashedPassword
    });

    await newUser.save();
    return done(null, newUser);
  } catch (error) {
    return done(error);
  }
}));

passport.use('local-login', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return done(null, false, { message: 'Usuario no encontrado' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return done(null, false, { message: 'Contraseña incorrecta' });
    }

    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

passport.use(new GitHubStrategy({
  clientID: config.GITHUB_CLIENT_ID,
  clientSecret: config.GITHUB_CLIENT_SECRET,
  callbackURL: "http://localhost:8080/api/sessions/github"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ githubId: profile.id });
    if (!user) {
      user = new User({
        githubId: profile.id,
        firstName: profile.displayName || profile.username,
        email: profile.emails[0].value,
      });
      await user.save();
    }
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;