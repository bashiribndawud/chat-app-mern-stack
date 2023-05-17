import jwt, { Secret } from "jsonwebtoken";
import UserModel from "../models/User";

const jwtSecret = process.env.SECRET;

export const isAuthenticated = async (
  req,
  res,
  next
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "authorization header not set" });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "token not found" });
    }
    const userId = await jwt.verify(token, jwtSecret);

    if (typeof userId === "string") {
      // Handle the case when userId is a string
      console.log(userId);
    } else {
      // Handle the case when userId is a JwtPayload object
      // console.log(userId.id); // Accessing the id property
      const user = await UserModel.findById(userId.id);
      if (!user) {
        return res.status(404).json({ err: "User not found" });
      }
      console.log(user);
    }

    next();
  } catch (error) {
    res.status(503).json({
      err: "Token is not valid",
    });
  }
};
