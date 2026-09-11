import { User, IUser } from '../models/user.model.js';

const create = async (userData: Partial<IUser>): Promise<IUser> => {
  const user = new User(userData);
  return await user.save();
};

const findByEmail = async (email: string): Promise<IUser | null> => {
  return await User.findOne({ email: email.toLowerCase().trim() });
};

const findById = async (id: string): Promise<IUser | null> => {
  return await User.findById(id).select('-password');
};

const findByIdWithPassword = async (id: string): Promise<IUser | null> => {
  return await User.findById(id);
};

const userRepository = {
  create,
  findByEmail,
  findById,
  findByIdWithPassword,
};

export { userRepository };
export default userRepository;
