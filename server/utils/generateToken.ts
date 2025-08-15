import jwt from "jsonwebtoken";
import { IUserDocument } from "../models/user.model";
import { Response } from "express";

export const generateToken = (res: Response, user: IUserDocument) => {
  const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY!, {
    expiresIn: "1d",
  });

  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("token", token, {
    httpOnly: true,
    // This is the corrected line: Use 'none' for production and 'lax' for development.
    // 'strict' will prevent cookies from being sent from one localhost port to another.
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
    maxAge: 24 * 60 * 60 * 1000,
  });
  return token;
};
