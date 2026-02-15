import { loginSchema, registerSchema } from "../validators/auth.schema.js";
import bcrypt from 'bcrypt';
import { prisma } from "../db/client.js";
import { generateToken } from "../utils/jwt.js";

export const registerController = async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { name, email, password } = validatedData;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(409).json({ error: 'Email already in use' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: 'USER' },
    });

    return res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    if (error.name === 'ZodError') return res.status(400).json({ errors: error.errors });
    console.error(error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};

export const loginController = async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    const user = await prisma.user.findUnique({ where: { email } });

    // Unified message for security
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Create JWT
const token = generateToken({
  id: user.id,
  email: user.email,
  role: user.role
});


    return res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({ errors: error.errors });
    }

    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export const profileController = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id }});
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    })
  } catch (error){
    return res.status(500).json({ error: 'Something went wrong' });
  }
}