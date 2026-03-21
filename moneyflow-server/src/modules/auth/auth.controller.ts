import { Request, Response } from "express";
import * as authService from "./auth.service";

// ================= REGISTER =================

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const { user, accessToken, refreshToken } =
      await authService.registerService(name, email, password);

    return res.status(201).json({
      message: "User registered successfully",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: any) {
    if (error.message === "EMAIL_EXISTS") {
      return res.status(400).json({ message: "Email already in use" });
    }

    return res.status(500).json({ message: "Server error" });
  }
};

// ================= LOGIN =================

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Missing email or password" });
    }

    const { user, accessToken, refreshToken } = await authService.loginService(
      email,
      password,
    );

    return res.json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: any) {
    if (error.message === "INVALID_CREDENTIALS") {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (error.message === "USER_DISABLED") {
      return res.status(403).json({ message: "Account is disabled" });
    }

    return res.status(500).json({ message: "Server error" });
  }
};

// ================= REFRESH TOKEN =================

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token" });
    }

    const tokens = await authService.refreshTokenService(refreshToken);

    return res.json(tokens);
  } catch (error: any) {
    if (
      error.message === "INVALID_TOKEN" ||
      error.message === "USER_NOT_ALLOWED"
    ) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    return res.status(500).json({ message: "Server error" });
  }
};

// ================= LOGOUT =================

export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token required" });
    }

    await authService.logoutService(refreshToken);

    return res.json({ message: "Logged out successfully" });
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};
