import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new Schema({

  first_name: {
    type: String,
    required: true
  },

  last_name: {
    type: String,
    required: true
  },

  age: {
    type: Number,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ['admin', 'user', 'premium'],
    default: 'user'
  },

  resetPasswordToken: String,
  resetPasswordExpires: Date,

  cart: {
    type: Schema.Types.ObjectId,
    ref: 'Cart'
  },
  documents: [{
    name: {
      type: String,
      required: true
    },
    reference: {
      type: String,
      required: true
    }
  }],
  last_connection: {
    type: Date
  }
});

userSchema.pre('save', async function (next) {
  const user = this;
  if (!user.isModified('password')) {
    return next();
  }
  try {
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  next();
  } catch(error) {
    next(error);
  }
});

export const userModel = model('User', userSchema);