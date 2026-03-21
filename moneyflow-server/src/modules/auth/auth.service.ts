import { UserModel } from "../user/user.model";
import { RefreshTokenModel } from "./refreshToken.model";
import jwt from "jsonwebtoken";

const generateAccessToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET as string, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES as string,
  });
};

const generateRefreshToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES as string,
  });
};

export const registerService = async (
  name: string,
  email: string,
  password: string,
) => {
  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    throw new Error("EMAIL_EXISTS");
  }

  const user = await UserModel.create({ name, email, password });

  const accessToken = generateAccessToken(user._id.toString());
  const refreshToken = generateRefreshToken(user._id.toString());

  await RefreshTokenModel.create({
    userId: user._id,
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return { user, accessToken, refreshToken };
};

export const loginService = async (email: string, password: string) => {
  const user = await UserModel.findOne({ email }).select("+password");

  if (!user) throw new Error("INVALID_CREDENTIALS");
  if (!user.isActive) throw new Error("USER_DISABLED");

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new Error("INVALID_CREDENTIALS");

  const accessToken = generateAccessToken(user._id.toString());
  const refreshToken = generateRefreshToken(user._id.toString());

  await RefreshTokenModel.create({
    userId: user._id,
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return { user, accessToken, refreshToken };
};

export const refreshTokenService = async (token: string) => {
  const stored = await RefreshTokenModel.findOne({ token });
  if (!stored) throw new Error("INVALID_TOKEN");

  const decoded = jwt.verify(
    token,
    process.env.JWT_REFRESH_SECRET as string,
  ) as { userId: string };

  const user = await UserModel.findById(decoded.userId);
  if (!user || !user.isActive) throw new Error("USER_NOT_ALLOWED");

  await RefreshTokenModel.deleteOne({ token });

  const newAccessToken = generateAccessToken(decoded.userId);
  const newRefreshToken = generateRefreshToken(decoded.userId);

  await RefreshTokenModel.create({
    userId: decoded.userId,
    token: newRefreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

export const logoutService = async (token: string) => {
  await RefreshTokenModel.deleteOne({ token });
};
