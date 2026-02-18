import { loginSchema, registerSchema } from "../validators/auth.schema.js";
import bcrypt from 'bcrypt';
import { prisma } from "../db/client.js";
import { generateToken } from "../utils/jwt.js";
import { ApiResponse } from "../utils/response.js";

export const registerController = async (req, res, next) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { name, email, password } = validatedData;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return ApiResponse.error(res, 409, 'Email already in use');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: 'USER' },
    });

    return ApiResponse.success(res, 201, "User registered successfully", {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    return next(error);
  }
};

export const loginController = async (req, res, next) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    const user = await prisma.user.findUnique({ where: { email } });

    // Unified message for security
    if (!user) {
      return ApiResponse.error(res, 401, "Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return ApiResponse.error(res, 401, "Invalid credentials");
    }

    // Create JWT
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });


    return ApiResponse.success(res, 200, "Login successful", {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    return next(error);
  }
};

export const profileController = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id }});
    if (!user) {
      return ApiResponse.error(res, 404, 'User not found');
    }
    return ApiResponse.success(res, 200, "Profile fetched successfully", {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error){
    return next(error);
  }
}