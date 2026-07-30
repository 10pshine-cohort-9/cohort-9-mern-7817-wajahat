const bcrypt = require("bcrypt");
const prisma = require("../config/prisma");
const logger = require("../config/logger");
const { generateToken } = require("../utils/jwt");


const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

const registerUser = async ({ firstName, lastName, email, password }) => {
  if (!email || !password) {
    const error = new Error("Email and password are required");
    error.statusCode = 400;
    throw error;
  }

  if (!EMAIL_REGEX.test(email)) {
    const error = new Error("Invalid email format");
    error.statusCode = 400;
    throw error;
  }

  if (!PASSWORD_REGEX.test(password)) {
    const error = new Error(
      "Password must be at least 8 characters and include a number and a special character"
    );
    error.statusCode = 400;
    throw error;
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    logger.warn({ email }, "Registration failed: email already exists");
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

  logger.info(
    { userId: user.id, email: user.email },
    "user registered successfully"
  );

  const token = generateToken({
    id: user.id,
    email: user.email,
  });

  return {
    user,
    token,
  };
};


module.exports = {
  registerUser,
};

