import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/user.repository.js';
import { ERROR_CODES, AppError } from '../constants/errorCodes.js';
import { IUser } from '../models/user.model.js';

const generateToken = (user: IUser): string => {
  const secret = process.env.JWT_SECRET || 'fallback_secret_key';
  const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as any;

  return jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
    },
    secret,
    { expiresIn }
  );
};

const register = async (name: string, email: string, password: string, role: 'user' | 'admin' = 'user') => {
  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    throw new AppError(ERROR_CODES.USER_ALREADY_EXISTS);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = await userRepository.create({
    name,
    email,
    password: hashedPassword,
    role,
  });

  const token = generateToken(newUser);

  return {
    token,
    user: {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    },
  };
};

const login = async (email: string, password: string) => {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new AppError(ERROR_CODES.INVALID_CREDENTIALS);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError(ERROR_CODES.INVALID_CREDENTIALS);
  }

  const token = generateToken(user);

  return {
    token,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

const getProfile = async (userId: string) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new AppError(ERROR_CODES.NOT_FOUND, 'User not found');
  }
  return user;
};

const authService = {
  register,
  login,
  getProfile,
};

export { authService };
export default authService;
