import UserModel from "../models/User.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs"
dotenv.config();
const jwtSecret = process.env.SECRET;

export const register = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Provide all fields" });
  }
  const usernameExist = await UserModel.find({ username });

  if (usernameExist.length !== 0) {
    return res.status(404).json({ message: "Username taken" });
  }
  const hashedPassword = await bcryptjs.hash(password, 10)
  const createdUser = await UserModel.create({ username, password: hashedPassword });
  const payload = { id: createdUser._id, username: createdUser.username };
  if (createdUser) {
    jwt.sign(
      payload,
      jwtSecret,
      { algorithm: "HS256" },
      (error, token) => {
        if (error) throw error;
        return res
          .cookie("token", token, { sameSite: "none", secure: true })
          .status(201)
          .json({ username: createdUser.username, id: createdUser._id, token });
      }
    );
  }
};

export const Profile = async (req, res) => {
  const token = req.query.token;
  const  userId  = await jwt.verify(token, jwtSecret);
  if (typeof userId === "string") {
    // Handle the case when userId is a string
    console.log(userId);
  } else {
    // Handle the case when userId is a JwtPayload object
    // console.log(userId.id); // Accessing the id property
    const user = await UserModel.findById(userId.id)
    if(user){
      const {id, username} = user;
      return res.status(200).json({id, username})
    }else{
      return res.status(404).json({message: "User not found"})
    }
    
  }
};


export const Login = async (req, res) => {
  const {username, password} = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Provide all fields" });
  }
  const userExits = await UserModel.findOne({username})
  if(!userExits){
    return res.status(404).json({message: "User not found"})
  }

  const comparePassword = await bcryptjs.compare(password.toString(), userExits.password.toString());
  if(comparePassword){
    const payload = {id: userExits._id, username: userExits.username}
    console.log(payload)
    jwt.sign(payload, jwtSecret, {algorithm: 'HS256'}, (error, token) => {
      if(error) throw error;
      res
        .status(200)
        .cookie("token", token, { sameSite: "none", secure: true })
        .json({ username: userExits.username, id: userExits._id, token });
    })
  }

}
