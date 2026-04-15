import { Request, Response } from "express";
import * as accountService from "./account.service";
import {
  createAccountSchema,
  settleAccountSchema,
  updateAccountSchema,
} from "./account.validation";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { buildValidationError, t } from "../../i18n";

export const createAccount = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: t(req, "auth.notAuthorized") });
    }

    const parsed = createAccountSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(buildValidationError(req, parsed.error));
    }

    const account = await accountService.createAccountService(
      userId,
      parsed.data,
    );

    return res.status(201).json(account);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INSUFFICIENT_SOURCE_BALANCE"
    ) {
      return res.status(400).json({
        message: t(req, "account.insufficientSourceBalance"),
      });
    }

    if (
      error instanceof Error &&
      (error.message === "SOURCE_ACCOUNT_NOT_FOUND" ||
        error.message === "INVALID_SOURCE_ACCOUNT")
    ) {
      return res.status(400).json({
        message: t(req, "account.sourceAccountInvalid"),
      });
    }

    console.error("CREATE ACCOUNT ERROR:", error);
    return res.status(500).json({ message: t(req, "common.serverError") });
  }
};

export const getAccounts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: t(req, "auth.notAuthorized") });
    }

    const accounts = await accountService.getAccountsService(userId);

    return res.json(accounts);
  } catch {
    return res.status(500).json({ message: t(req, "common.serverError") });
  }
};

export const getAccountById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: t(req, "auth.notAuthorized") });
    }
    const { id } = req.params;
    const accountId = String(id);

    const account = await accountService.getAccountByIdService(
      userId,
      accountId,
    );

    if (!account) {
      return res.status(404).json({ message: t(req, "account.notFound") });
    }

    return res.json(account);
  } catch {
    return res.status(500).json({ message: t(req, "common.serverError") });
  }
};

export const updateAccount = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: t(req, "auth.notAuthorized") });
    }
    const { id } = req.params;
    const accountId = String(id);

    const parsed = updateAccountSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(buildValidationError(req, parsed.error));
    }

    const account = await accountService.updateAccountService(
      userId,
      accountId,
      parsed.data,
    );

    if (!account) {
      return res.status(404).json({ message: t(req, "account.notFound") });
    }

    return res.json(account);
  } catch {
    return res.status(500).json({ message: t(req, "common.serverError") });
  }
};

export const deleteAccount = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: t(req, "auth.notAuthorized") });
    }
    const { id } = req.params;
    const accountId = String(id);

    const account = await accountService.deleteAccountService(
      userId,
      accountId,
    );

    if (!account) {
      return res.status(404).json({ message: t(req, "account.notFound") });
    }

    return res.json({ message: t(req, "account.deletedSuccess") });
  } catch {
    return res.status(500).json({ message: t(req, "common.serverError") });
  }
};

export const settleAccount = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: t(req, "auth.notAuthorized") });

    const parsed = settleAccountSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return res.status(400).json(buildValidationError(req, parsed.error));
    }

    const account = await accountService.settleAccountService(
      userId,
      String(req.params.id),
      parsed.data,
    );

    return res.json(account);
  } catch (err: any) {
    if (err?.message === "SAVING_ACCOUNT_NOT_FOUND") {
      return res.status(404).json({ message: t(req, "account.notFound") });
    }

    if (err?.message === "ACCOUNT_ALREADY_SETTLED") {
      return res.status(400).json({
        message: t(req, "account.alreadySettled"),
      });
    }

    if (err?.message === "SETTLEMENT_ACCOUNT_REQUIRED") {
      return res.status(400).json({
        message: t(req, "account.settlementAccountRequired"),
      });
    }

    if (err?.message === "SETTLEMENT_ACCOUNT_INVALID") {
      return res.status(400).json({
        message: t(req, "account.settlementAccountInvalid"),
      });
    }

    console.error("SETTLE ACCOUNT ERROR:", err);
    return res.status(500).json({ message: t(req, "common.serverError") });
  }
};
