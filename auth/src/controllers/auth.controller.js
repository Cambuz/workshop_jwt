const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require("../models/user.model");
const User_DB = [];

exports.register = (req, res) => {
  console.log('Request body:', req.body);
  console.log('Username:', req.body.username);
  console.log('Password:', req.body.password);

  if (!req.body || !req.body.username || !req.body.password) {
    console.log('Missing required fields');
    return res.status(400).json({
      "msg": "Username and password are required",
      "received": req.body
    });
  }

  try {
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    console.log('Password hashed successfully');
    
    const newUser = new User(req.body.username, hashedPassword);
    console.log('New user created:', { username: newUser.username });
    
    User_DB.push(newUser);
    console.log('User added to database');
    
    return res.status(201).json({
      "msg": "New User created !"
    });
  } catch (error) {
    console.error('Error in register:', error);
    return res.status(500).json({
      "msg": "Error creating user",
      "error": error.message
    });
  }
};

exports.login = (req, res) => {
    const { username, password } = req.body;
    console.log('JWT Key:', process.env.ACCESS_JWT_KEY);
    const user = User_DB.find((u) => u.username === username && bcrypt.compareSync(password, u.password));
    if (user) {
      try {
        const accessToken = jwt.sign(
          { username: user.username, exp: Math.floor(Date.now() / 1000) + 120 },
          process.env.ACCESS_JWT_KEY
        );
        console.log('Token generated successfully');
        return res.status(200).json({
          message: "You are now connected!",
          token: accessToken
        });
      } catch (error) {
        console.error('Error generating token:', error);
        return res.status(500).json({ message: "Error generating token", error: error.message });
      }
    } else {
      return res.status(401).json({ message: "Invalid credentials" });
    }
  };

exports.authenticate = (req, res) => {
  let token = req.headers["authorization"];

  if (!token) {
    return res.status(403).json({
      message: "No token provided!"
    });
  }

  // Remove "Bearer " prefix from token
  token = token.replace("Bearer ", "");

  jwt.verify(token, process.env.ACCESS_JWT_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        message: "Unauthorized!",
        error: err.message
      });
    }

    // Check if user exists
    const user = User_DB.find(u => u.username === decoded.username);
    if (!user) {
      return res.status(401).json({
        message: "User not found!"
      });
    }

    // Token is valid and user exists
    return res.status(200).json({
      message: "Token is valid!",
      user: {
        username: user.username
      }
    });
  });
};