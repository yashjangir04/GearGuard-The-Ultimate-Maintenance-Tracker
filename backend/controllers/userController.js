import User from "../models/userModel.jsx";
import asyncHandler from "../middlewares/asyncHandler.js";
import bcrypt from "bcryptjs";
import createToken from "../utils/createToken.js";

const createUser= asyncHandler(async(req, res) => {
  const {username, password, email}= req.body;

  if(!username || !password || !email) {
    throw new Error("All fields are required!");
  }

  const userExists= await User.findOne({email});

  if(userExists) {
    res.status(400).json("User already exists!");
  }
  
  const salt= await bcrypt.genSalt(10);
  const hashedPwd= await bcrypt.hash(password, salt);
  const newUser= new User({username, password: hashedPwd, email});

  try {
    newUser.save();
    createToken(res, newUser.id);

    res
      .status(201)
      .json({
        id: newUser.id, 
        username: newUser.username, 
        email: newUser.email, 
        password: newUser.password, 
        isAdmin: newUser.isAdmin
      });
  } catch(error) {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

const loginUser= asyncHandler(async(req, res) => {
  const {email, password}= req.body;
  
  if(!password || !email) {
    throw new Error("All fields are required!");
  }

  const existingUser= await User.findOne({email});

  if(existingUser) {
    const isPasswordValid= await bcrypt.compare(password, existingUser.password);

    if(isPasswordValid) {
      createToken(res, existingUser.id);
      res
      .status(201)
      .json({
        id: existingUser.id, 
        username: existingUser.username, 
        email: existingUser.email, 
        password: existingUser.password, 
        isAdmin: existingUser.isAdmin
      });
    }
    return;
  }
});

const logoutCurrentUser= asyncHandler(async(req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({message: "Logged Out Successfully."})
});

const getAllUsers= asyncHandler(async(req, res) => {
  const allUsers= await User.find({});
  res.json(allUsers);
});

const userCurrentProfile= asyncHandler(async(req, res) => {
  const user= await User.findById(req.user._id);
  
  if(user) {
    res.json({
      _id: user.id,
      username: user.username,
      email: user.email
    })
  } else {
    req.status(404)
    throw new Error("User not found!");
  }
});

const updateCurrentProfile= asyncHandler(async(req, res) => {
  const user= await User.findById(req.user._id);
  if(user) {
    if(req.body.username) user.username= req.body.username;
    if(req.body.email) user.email= req.body.email;
    if(req.body.password) {
      const salt= await bcrypt.genSalt(10);
      const hashedPassword= await bcrypt.hash(req.body.password, salt);
      user.password= hashedPassword;
    }

    const updatedUser=  await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin
    });
  } else {
    req.status(404)
    throw new Error("User not found!");
  }
});

const deleteUserById= asyncHandler(async(req, res) => {
  const user= await User.findById(req.params.id);

  if(user) {
    if(user.isAdmin) {
      res.status(400)
      throw new Error("Cannot delete the admin user.")
    }
    await User.deleteOne({_id: user._id});
    res.json({message: "User removed."});
  } else {
    req.status(404)
    throw new Error("User not found!");
  }
});

const getUserById= asyncHandler(async(req, res) => {
  const user= await User.findById(req.params.id).select("-password");
  
  if(user) {
    res.json(user);
  } else {
    res.status(404)
    throw new Error("User not found!");
  }
});

const updateUserById= asyncHandler(async(req, res) => {
  const user= await User.findById(req.params.id);

  if(user) {
    user.username= req.body.username || user.username;
    user.email= req.body.email || user.email;
    user.isAdmin= Boolean(req.body.isAdmin);
    
    const updatedUser= await user.save();
    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin
    });
  } else {
    res.status(404)
    throw new Error("User not found!");
  }
});

export {
  createUser, 
  loginUser, 
  logoutCurrentUser, 
  getAllUsers, 
  userCurrentProfile, 
  updateCurrentProfile,
  deleteUserById,
  getUserById,
  updateUserById,
};