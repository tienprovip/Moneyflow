import { Response } from "express";
import * as transactionService from "./transaction.service";
import {
  createTransactionSchema,
  getSummaryQuerySchema,
  updateTransactionSchema,
} from "./transaction.validation";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { buildValidationError, t } from "../../i18n";

// ================= CREATE =================
export const createTransaction = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res
        .status(401)
        .json({ message: t(req, "auth.notAuthorized") });
    }

    const parsed = createTransactionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json(buildValidationError(req, parsed.error));
    }

    const transaction =
      await transactionService.createTransactionService(
        userId,
        parsed.data
      );

    return res.status(201).json(transaction);
  } catch (error: any) {
    if (error.message === "ACCOUNT_NOT_FOUND") {
      return res
        .status(404)
        .json({ message: t(req, "account.notFound") });
    }

    if (error.message === "INSUFFICIENT_BALANCE") {
      return res
        .status(400)
        .json({ message: t(req, "transaction.insufficientBalance") });
    }

    console.error("CREATE TRANSACTION ERROR:", error);
    return res
      .status(500)
      .json({ message: t(req, "common.serverError") });
  }
};

// ================= GET LIST =================
export const getTransactions = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res
        .status(401)
        .json({ message: t(req, "auth.notAuthorized") });
    }

    const transactions =
      await transactionService.getTransactionsService(
        userId,
        req.query
      );

    return res.json(transactions);
  } catch (error) {
    console.error("GET TRANSACTIONS ERROR:", error);
    return res
      .status(500)
      .json({ message: t(req, "common.serverError") });
  }
};

// ================= GET SUMMARY =================
export const getSummary = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res
        .status(401)
        .json({ message: t(req, "auth.notAuthorized") });
    }

    const parsed = getSummaryQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res
        .status(400)
        .json(buildValidationError(req, parsed.error));
    }

    const { month, year, from, to } = parsed.data;
    const hasMonth = Boolean(month);
    const hasYear = Boolean(year);
    const hasRange = Boolean(from || to);
    const selectedModes = [hasMonth, hasYear, hasRange].filter(Boolean).length;

    if (selectedModes > 1) {
      return res.status(400).json({
        message: t(req, "transaction.invalidSummaryQuery"),
      });
    }

    if ((from && !to) || (!from && to)) {
      return res.status(400).json({
        message: t(req, "transaction.invalidSummaryRange"),
      });
    }

    if (from && to && from > to) {
      return res.status(400).json({
        message: t(req, "transaction.invalidSummaryRange"),
      });
    }

    const summary =
      await transactionService.getSummaryService(
        userId,
        parsed.data
      );

    return res.json(summary);
  } catch (error) {
    console.error("GET SUMMARY ERROR:", error);
    return res
      .status(500)
      .json({ message: t(req, "common.serverError") });
  }
};

// ================= UPDATE =================
export const updateTransaction = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res
        .status(401)
        .json({ message: t(req, "auth.notAuthorized") });
    }

    const { id } = req.params;
    const transactionId = String(id);

    const parsed = updateTransactionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json(buildValidationError(req, parsed.error));
    }

    const transaction =
      await transactionService.updateTransactionService(
        userId,
        transactionId,
        parsed.data
      );

    if (!transaction) {
      return res.status(404).json({
        message: t(req, "transaction.notFound"),
      });
    }

    return res.json(transaction);
  } catch (error: any) {
    if (error.message === "TRANSACTION_NOT_FOUND") {
      return res.status(404).json({
        message: t(req, "transaction.notFound"),
      });
    }

    if (error.message === "ACCOUNT_NOT_FOUND") {
      return res.status(404).json({
        message: t(req, "account.notFound"),
      });
    }

    if (error.message === "INSUFFICIENT_BALANCE") {
      return res.status(400).json({
        message: t(req, "transaction.insufficientBalance"),
      });
    }

    console.error("UPDATE TRANSACTION ERROR:", error);
    return res
      .status(500)
      .json({ message: t(req, "common.serverError") });
  }
};

// ================= DELETE =================
export const deleteTransaction = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res
        .status(401)
        .json({ message: t(req, "auth.notAuthorized") });
    }

    const { id } = req.params;
    const transactionId = String(id);

    const result =
      await transactionService.deleteTransactionService(
        userId,
        transactionId
      );

    if (!result) {
      return res.status(404).json({
        message: t(req, "transaction.notFound"),
      });
    }

    return res.json({
      message: t(req, "transaction.deletedSuccess"),
    });
  } catch (error: any) {
    if (error.message === "TRANSACTION_NOT_FOUND") {
      return res.status(404).json({
        message: t(req, "transaction.notFound"),
      });
    }

    if (error.message === "ACCOUNT_NOT_FOUND") {
      return res.status(404).json({
        message: t(req, "account.notFound"),
      });
    }

    console.error("DELETE TRANSACTION ERROR:", error);
    return res
      .status(500)
      .json({ message: t(req, "common.serverError") });
  }
};
