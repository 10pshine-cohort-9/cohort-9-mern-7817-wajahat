const bcrypt = require("bcrypt");
const prisma = require("../config/prisma");
const logger = require("../config/logger");
const jwt = require("../utils/jwt");
const { error } = require("node:console");
const { use } = require("react");


const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
//configured this for email and password checks
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
  try{
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
    { userId: user.id },
    "user registered successfully"
  );

  const token = jwt.generateToken({
    id: user.id,
    email: user.email,
  });

  return {
    user,
    token,
  };

}
catch(err){
  throw err;
}
};


const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    const error = new Error("Email and password both are required");
    error.statusCode = 400;
    throw error;
  }
  const userFound = await prisma.user.findUnique({
    where: {
      email:email
    },
  });
  if (!userFound) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }
  const isPasswordCorrect = await bcrypt.compare(
    password,
    userFound.password
  );

  if (!isPasswordCorrect) {
    const error = new Error(" Invalid password, try again");
    error.statusCode = 401;
    throw error;
  }

  logger.info(
    {
      userId: userFound.id,
    },
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
};

const getMe=async(userid)=>{
  const user= await prisma.user.findUnique({
    where:{
      id:userid
    },
    select:{
      id:true,
      firstName:true,
      lastName:true,
      email:true,
      createdAt:true,
      updatedAt:true
    }
  })
  if(!user){
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }
  logger.info({
    id:user.id
  },"user profile fetched successfully");
  return user;
}

const logoutUser = async (user) => {
  logger.info(
    {
      userId: user.id
    },
    "User logged out successfully"
  );

  return {
    success: true,
    message: "User logged out successfully",
  };
};


module.exports = {
  registerUser, loginUser, getMe,logoutUser
};

