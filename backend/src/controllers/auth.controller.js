import { loginSchema, registerSchema, createUserSchema } from "../validators/auth.schema.js";
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { prisma } from "../db/client.js";
import { generateToken } from "../utils/jwt.js";
import { ApiResponse } from "../utils/response.js";
import { sendResetPasswordEmail } from "../services/mail.service.js";

export const registerController = async (req, res, next) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { name, email, password, organizationName } = validatedData;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return ApiResponse.error(res, 409, 'Email already in use');

    const existingOrg = await prisma.organization.findUnique({ where: { name: organizationName } });
    if (existingOrg) return ApiResponse.error(res, 409, 'Organization name already exists');

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create Organization and the Admin User together
    const organization = await prisma.organization.create({
      data: {
        name: organizationName,
        users: {
          create: {
            name,
            email,
            password: hashedPassword,
            role: 'ADMIN',
          }
        }
      },
      include: {
        users: true // To get the created user
      }
    });

    const user = organization.users[0];

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: organization.id,
    });

    return ApiResponse.success(res, 201, "User registered successfully", {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: organization.id,
        organizationName: organization.name
      },
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
      role: user.role,
      organizationId: user.organizationId
    });


    return ApiResponse.success(res, 200, "Login successful", {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId
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
      organizationId: user.organizationId
    });
  } catch (error) {
    return next(error);
  }
};

export const getAgentsController = async (req, res, next) => {

  try {
    const whereClause = { role: "AGENT" };
    if (req.user.role !== "SUPER_ADMIN") {
      whereClause.organizationId = req.user.organizationId;
    }

    const agents = await prisma.user.findMany({
      where: whereClause,
      select: { 
        id: true, 
        name: true, 
        email: true, 
        organization: { select: { name: true } } 
      },
      orderBy: { name: "asc" },
    });
    return ApiResponse.success(res, 200, "Agents fetched successfully", agents);
  } catch (error) {
    return next(error);
  }
};

export const getUsersController = async (req, res, next) => {
  try {
    const whereClause = {};
    if (req.user.role !== "SUPER_ADMIN") {
      whereClause.organizationId = req.user.organizationId;
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: { 
        id: true, 
        name: true, 
        email: true, 
        role: true, 
        createdAt: true,
        organization: { select: { name: true } }
      },
      orderBy: { createdAt: "desc" },
    });
    return ApiResponse.success(res, 200, "Users fetched successfully", users);
  } catch (error) {
    return next(error);
  }
};

export const createUserController = async (req, res, next) => {
  try {
    // Only ADMIN or SUPER_ADMIN can create users directly
    if (req.user.role === 'USER' || req.user.role === 'AGENT') {
      return ApiResponse.error(res, 403, "Forbidden: Only Admins can create users");
    }

    const validatedData = createUserSchema.parse(req.body);
    const { name, email, password, role } = validatedData;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return ApiResponse.error(res, 409, 'Email already in use');

    // Super Admins could potentially specify an organizationId, but for now we'll 
    // assign to the requester's organization.
    const organizationId = req.user.organizationId;

    if (!organizationId) {
      return ApiResponse.error(res, 400, "Cannot create user: Admin does not belong to an organization");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { 
        name, 
        email, 
        password: hashedPassword, 
        role,
        organizationId 
      },
      select: { id: true, name: true, email: true, role: true, organizationId: true }
    });

    return ApiResponse.success(res, 201, "User created successfully", user);
  } catch (error) {
    return next(error);
  }
};

export const updateUserRoleController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const VALID_ROLES = ["USER", "AGENT", "ADMIN"];
    if (!role || !VALID_ROLES.includes(role)) {
      return ApiResponse.error(res, 400, `Role must be one of: ${VALID_ROLES.join(", ")}`);
    }

    // Prevent admin from changing their own role
    if (id === req.user.id) {
      return ApiResponse.error(res, 400, "You cannot change your own role");
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return ApiResponse.error(res, 404, "User not found");

    if (req.user.role !== "SUPER_ADMIN" && user.organizationId !== req.user.organizationId) {
      return ApiResponse.error(res, 403, "Forbidden: User belongs to another organization");
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    return ApiResponse.success(res, 200, "User role updated successfully", updated);
  } catch (error) {
    return next(error);
  }
};

export const updateProfileController = async (req, res, next) => {
  try {
    const { name, password } = req.body;
    const userId = req.user.id;

    const data = {};
    if (name) data.name = name;
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    if (Object.keys(data).length === 0) {
      return ApiResponse.error(res, 400, "No changes provided");
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, name: true, email: true, role: true },
    });

    return ApiResponse.success(res, 200, "Profile updated successfully", updatedUser);
  } catch (error) {
    return next(error);
  }
};

export const forgotPasswordController = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return ApiResponse.error(res, 400, "Email is required");

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Return success even if user not found to prevent enumeration
      return ApiResponse.success(res, 200, "If an account with that email exists, a password reset link has been sent.");
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
    const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: resetTokenHash, resetTokenExpiry },
    });

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    
    // Send email asynchronously
    sendResetPasswordEmail(email, resetLink).catch(err => console.error("Email send failed", err));

    return ApiResponse.success(res, 200, "If an account with that email exists, a password reset link has been sent.");
  } catch (error) {
    return next(error);
  }
};

export const resetPasswordController = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return ApiResponse.error(res, 400, "Token and password are required");

    const resetTokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await prisma.user.findFirst({
      where: {
        resetToken: resetTokenHash,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) return ApiResponse.error(res, 400, "Invalid or expired token");

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return ApiResponse.success(res, 200, "Password reset successfully. You can now login.");
  } catch (error) {
    return next(error);
  }
};
