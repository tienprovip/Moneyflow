import { Request, Response } from "express";
import * as authService from "./auth.service";
import { t } from "../../i18n";

// ================= REGISTER =================

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: t(req, "auth.missingRequiredFields") });
    }

    const { user, accessToken, refreshToken } =
      await authService.registerService(name, email, password);

    return res.status(201).json({
      message: t(req, "auth.registerSuccess"),
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
      return res.status(400).json({ message: t(req, "auth.emailExists") });
    }

    return res.status(500).json({ message: t(req, "common.serverError") });
  }
};

// ================= LOGIN =================

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: t(req, "auth.missingEmailOrPassword") });
    }

    const { user, accessToken, refreshToken } = await authService.loginService(
      email,
      password,
    );

    return res.json({
      message: t(req, "auth.loginSuccess"),
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
      return res
        .status(400)
        .json({ message: t(req, "auth.invalidCredentials") });
    }

    if (error.message === "USER_DISABLED") {
      return res.status(403).json({ message: t(req, "auth.accountDisabled") });
    }

    return res.status(500).json({ message: t(req, "common.serverError") });
  }
};

// ================= REFRESH TOKEN =================

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: t(req, "auth.noRefreshToken") });
    }

    const tokens = await authService.refreshTokenService(refreshToken);

    return res.json(tokens);
  } catch (error: any) {
    if (
      error.message === "INVALID_TOKEN" ||
      error.message === "USER_NOT_ALLOWED"
    ) {
      return res
        .status(403)
        .json({ message: t(req, "auth.invalidOrExpiredToken") });
    }

    return res.status(500).json({ message: t(req, "common.serverError") });
  }
};

// ================= LOGOUT =================

export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res
        .status(400)
        .json({ message: t(req, "auth.refreshTokenRequired") });
    }

    await authService.logoutService(refreshToken);

    return res.json({ message: t(req, "auth.logoutSuccess") });
  } catch {
    return res.status(500).json({ message: t(req, "common.serverError") });
  }
};
