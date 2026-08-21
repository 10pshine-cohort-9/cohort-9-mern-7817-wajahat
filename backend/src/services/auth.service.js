const bcrypt = require("bcrypt");
const { z } = require("zod");
const prisma = require("../config/prisma");
const logger = require("../config/logger");
const jwt = require("../utils/jwt");

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

const registerSchema = z.object({
  firstName: z.string().trim().optional(),
  lastName: z.string().trim().optional(),
  email: z
    .string({ required_error: "Email and password are required" })
    .trim()
    .email("Invalid email format"),
  password: z
    .string({ required_error: "Email and password are required" })
    .min(8, "Password must be at least 8 characters and include a number and a special character")
    .refine(
      (val) => /\d/.test(val) && /[^A-Za-z0-9]/.test(val),
      "Password must be at least 8 characters and include a number and a special character"
    ),
});

const loginSchema = z.object({
  email: z
    .string({ required_error: "Email and password both are required" })
    .trim()
    .min(1, "Email and password both are required"),
  password: z
    .string({ required_error: "Email and password both are required" })
    .min(1, "Email and password both are required"),
});

// Helper to format validation errors
const validateInput = (schema, data) => {
  const result = schema.safeParse(data);
  if (!result.success) {
    const error = new Error(result.error.errors[0].message);
    error.statusCode = 400;
    throw error;
  }
  return result.data;
};

const registerUser = async (data) => {
  try {
    const { firstName, lastName, email, password } = validateInput(registerSchema, data);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      logger.warn({ userId: existingUser.id }, "Registration failed: email already exists");
      const error = new Error("Email already registered");
      error.statusCode = 409;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    logger.info({ userId: user.id }, "user registered successfully");

    const token = jwt.generateToken({
      id: user.id,
      email: user.email,
    });

    return {
      user,
      token,
    };
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    throw err;
  }
};

const loginUser = async (data) => {
  try {
    const { email, password } = validateInput(loginSchema, data);

    const userFound = await prisma.user.findUnique({
      where: { email },
    });

    if (!userFound) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    const isPasswordCorrect = await bcrypt.compare(password, userFound.password);

    if (!isPasswordCorrect) {
      const error = new Error("Invalid password, try again");
      error.statusCode = 401;
      throw error;
    }

    logger.info(
      { userId: userFound.id },
      "User logged in successfully"
    );

    const token = jwt.generateToken({
      id: userFound.id,
      email: userFound.email,
    });

    return {
      user: {
        id: userFound.id,
        firstName: userFound.firstName,
        lastName: userFound.lastName,
        email: userFound.email,
      },
      token,
    };
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    throw err;
  }
};

const getMe = async (userid) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userid,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    logger.info({ id: user.id }, "user profile fetched successfully");
    return user;
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    throw err;
  }
};

const logoutUser = async (user) => {
  try {
    logger.info(
      { userId: user.id },
      "User logged out successfully"
    );

    return {
      success: true,
      message: "User logged out successfully",
    };
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    throw err;
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
};