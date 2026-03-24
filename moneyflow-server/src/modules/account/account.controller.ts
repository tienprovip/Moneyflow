import { Request, Response } from "express";
import * as accountService from "./account.service";
import { createAccountSchema, updateAccountSchema } from "./account.validation";
import { AuthRequest } from "../../middlewares/auth.middleware";

export const createAccount = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const parsed = createAccountSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error);
    }

    const account = await accountService.createAccountService(
      userId,
      parsed.data,
    );

    return res.status(201).json(account);
  } catch (error) {
    console.error("CREATE ACCOUNT ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getAccounts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const accounts = await accountService.getAccountsService(userId);

    return res.json(accounts);
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};

export const getAccountById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authorized" });
    }
    const { id } = req.params;
    const accountId = String(id);

    const account = await accountService.getAccountByIdService(
      userId,
      accountId,
    );

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    return res.json(account);
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateAccount = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authorized" });
    }
    const { id } = req.params;
    const accountId = String(id);

    const parsed = updateAccountSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error);
    }

    const account = await accountService.updateAccountService(
      userId,
      accountId,
      parsed.data,
    );

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    return res.json(account);
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};

export const deleteAccount = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authorized" });
    }
    const { id } = req.params;
    const accountId = String(id);

    const account = await accountService.deleteAccountService(
      userId,
      accountId,
    );

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    return res.json({ message: "Deleted successfully" });
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};
