import { Request, Response, NextFunction } from "express";
import { ZodError, ZodIssue } from "zod";

export type Language = "en" | "vi";

type TranslationKey =
  | "auth.notAuthorized"
  | "auth.invalidToken"
  | "auth.missingRequiredFields"
  | "auth.registerSuccess"
  | "auth.emailExists"
  | "auth.missingEmailOrPassword"
  | "auth.loginSuccess"
  | "auth.invalidCredentials"
  | "auth.accountDisabled"
  | "auth.noRefreshToken"
  | "auth.invalidOrExpiredToken"
  | "auth.refreshTokenRequired"
  | "auth.logoutSuccess"
  | "account.notFound"
  | "account.deletedSuccess"
  | "common.serverError"
  | "validation.failed"
  | "validation.required"
  | "validation.mustBeNumber"
  | "validation.mustBeString"
  | "validation.invalidValue";

type Dictionary = Record<TranslationKey, string>;

const dictionaries: Record<Language, Dictionary> = {
  en: {
    "auth.notAuthorized": "Not authorized",
    "auth.invalidToken": "Token expired or invalid",
    "auth.missingRequiredFields": "Missing required fields",
    "auth.registerSuccess": "User registered successfully",
    "auth.emailExists": "Email already in use",
    "auth.missingEmailOrPassword": "Missing email or password",
    "auth.loginSuccess": "Login successful",
    "auth.invalidCredentials": "Invalid email or password",
    "auth.accountDisabled": "Account is disabled",
    "auth.noRefreshToken": "No refresh token",
    "auth.invalidOrExpiredToken": "Invalid or expired token",
    "auth.refreshTokenRequired": "Refresh token required",
    "auth.logoutSuccess": "Logged out successfully",
    "account.notFound": "Account not found",
    "account.deletedSuccess": "Deleted successfully",
    "common.serverError": "Server error",
    "validation.failed": "Validation failed",
    "validation.required": "{field} is required",
    "validation.mustBeNumber": "{field} must be a number",
    "validation.mustBeString": "{field} must be a string",
    "validation.invalidValue": "{field} has an invalid value",
  },
  vi: {
    "auth.notAuthorized": "Khong duoc phep truy cap",
    "auth.invalidToken": "Token het han hoac khong hop le",
    "auth.missingRequiredFields": "Thieu truong bat buoc",
    "auth.registerSuccess": "Dang ky tai khoan thanh cong",
    "auth.emailExists": "Email da duoc su dung",
    "auth.missingEmailOrPassword": "Thieu email hoac mat khau",
    "auth.loginSuccess": "Dang nhap thanh cong",
    "auth.invalidCredentials": "Email hoac mat khau khong dung",
    "auth.accountDisabled": "Tai khoan da bi vo hieu hoa",
    "auth.noRefreshToken": "Khong co refresh token",
    "auth.invalidOrExpiredToken": "Token khong hop le hoac da het han",
    "auth.refreshTokenRequired": "Can refresh token",
    "auth.logoutSuccess": "Dang xuat thanh cong",
    "account.notFound": "Khong tim thay tai khoan",
    "account.deletedSuccess": "Xoa thanh cong",
    "common.serverError": "Loi may chu",
    "validation.failed": "Du lieu khong hop le",
    "validation.required": "{field} la truong bat buoc",
    "validation.mustBeNumber": "{field} phai la so",
    "validation.mustBeString": "{field} phai la chuoi",
    "validation.invalidValue": "{field} khong hop le",
  },
};

const fieldLabels: Record<string, Record<Language, string>> = {
  name: { en: "Name", vi: "Ten" },
  email: { en: "Email", vi: "Email" },
  password: { en: "Password", vi: "Mat khau" },
  refreshToken: { en: "Refresh token", vi: "Refresh token" },
  type: { en: "Account type", vi: "Loai tai khoan" },
  balance: { en: "Balance", vi: "So du" },
  initialAmount: { en: "Initial amount", vi: "So tien ban dau" },
  interestRate: { en: "Interest rate", vi: "Lai suat" },
  termMonths: { en: "Term months", vi: "Ky han thang" },
};

declare global {
  namespace Express {
    interface Request {
      language?: Language;
    }
  }
}

export const detectLanguage = (req: Request): Language => {
  const queryLang =
    typeof req.query.lang === "string" ? req.query.lang.toLowerCase() : "";
  const headerLang =
    typeof req.headers["x-lang"] === "string"
      ? req.headers["x-lang"].toLowerCase()
      : "";
  const acceptLanguage =
    typeof req.headers["accept-language"] === "string"
      ? req.headers["accept-language"].toLowerCase()
      : "";

  const candidate = queryLang || headerLang || acceptLanguage;
  return candidate.startsWith("vi") ? "vi" : "en";
};

export const languageMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  req.language = detectLanguage(req);
  next();
};

export const getLanguage = (req: Request): Language => req.language ?? "en";

export const t = (
  req: Request,
  key: TranslationKey,
  params?: Record<string, string>,
) => {
  let text = dictionaries[getLanguage(req)][key];

  if (!params) {
    return text;
  }

  for (const [name, value] of Object.entries(params)) {
    text = text.replace(`{${name}}`, value);
  }

  return text;
};

const getFieldLabel = (field: string, language: Language) =>
  fieldLabels[field]?.[language] ?? field;

const formatIssueMessage = (issue: ZodIssue, language: Language) => {
  const field = issue.path[0] ? String(issue.path[0]) : "field";
  const fieldLabel = getFieldLabel(field, language);
  const dict = dictionaries[language];

  if (
    issue.code === "invalid_type" &&
    "input" in issue &&
    typeof issue.input === "undefined"
  ) {
    return dict["validation.required"].replace("{field}", fieldLabel);
  }

  if (issue.code === "too_small" && issue.minimum === 1) {
    return dict["validation.required"].replace("{field}", fieldLabel);
  }

  if (issue.code === "invalid_type") {
    const expected = "expected" in issue ? issue.expected : "";
    if (expected === "number") {
      return dict["validation.mustBeNumber"].replace("{field}", fieldLabel);
    }

    if (expected === "string") {
      return dict["validation.mustBeString"].replace("{field}", fieldLabel);
    }
  }

  return dict["validation.invalidValue"].replace("{field}", fieldLabel);
};

export const buildValidationError = (req: Request, error: ZodError) => {
  const language = getLanguage(req);

  return {
    message: dictionaries[language]["validation.failed"],
    errors: error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: formatIssueMessage(issue, language),
    })),
  };
};
