//lets create that user and LOGIN

import jwt from "jsonwebtoken";
import User from "../models/user";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

//registering new user
//ROUTE - POST /api/auth/signup
export const signup = async (req, res) => {
  try {
    const { name, email, password, theme } = req.body;

    //check if user already exists
    const userExist = await User.findOne({ email });

    if (userExist) {
      return res.status(400).json({
        success: false,
        error: "User with this email already exists",
      });
    }
    //we create a new user here (they passwords gon be hashed due to that cool pre-save hook)
    const user = await User.create({
      name,
      email,
      password,
      theme: theme || "cosmic",
    });

    //generate token
    const token = generateToken(user._id);

    // Send response (user.getPublicProfile() excludes password)
    res.status(201).json({
      success: true,
      data: {
        user: user.getPublicProfile(),
        token,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);

    // handle the validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        error: messages[0], // Send first validation error
      });
    }
    res.status(500).json({
      success: false,
      error: "Error creating user account",
    });
  }
};

//login user
//ROUTE - POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Please provide email and password",
      });
    }
    //find user and password field
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    //check if password matches
    const isPasswordMatch = await user.matchPassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    //generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        user: user.getPublicProfile(),
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      error: "Error logging in",
    });
  }
};

//Get current logged in user
//ROUTE - GET /api/auth/me
export const getMe = async (req, res) => {
    try {
        res.json({
            success: true, 
            data: {
                user: req.user
            }
        });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching user data'
        });
    };
};

//logout user
//ROUTE - POST /api/auth/logout
export const 
