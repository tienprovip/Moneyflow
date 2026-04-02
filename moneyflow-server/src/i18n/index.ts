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
  | "category.notFound"
  | "category.deletedSuccess"
  | "category.readOnly"
  | "common.serverError"
  | "validation.failed"
  | "validation.required"
  | "validation.mustBeNumber"
  | "validation.mustBeString"
  | "validation.invalidValue"
  | "transaction.notFound"
  | "transaction.deletedSuccess"
  | "transaction.insufficientBalance"
  | "transaction.missingMonth"
  | "transaction.invalidSummaryQuery"
  | "transaction.invalidSummaryRange";

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
    "category.notFound": "Category not found",
    "category.deletedSuccess": "Deleted successfully",
    "category.readOnly": "Default categories cannot be modified",
    "common.serverError": "Server error",
    "validation.failed": "Validation failed",
    "validation.required": "{field} is required",
    "validation.mustBeNumber": "{field} must be a number",
    "validation.mustBeString": "{field} must be a string",
    "validation.invalidValue": "{field} has an invalid value",
    "transaction.notFound": "Transaction not found",
    "transaction.deletedSuccess": "Deleted successfully",
    "transaction.insufficientBalance": "Insufficient balance",
    "transaction.missingMonth": "Missing month parameter",
    "transaction.invalidSummaryQuery":
      "Use only one summary filter: month, year, or from/to",
    "transaction.invalidSummaryRange":
      "From and to must be provided together, and from must be before or equal to to",
  },
  vi: {
    "auth.notAuthorized": "Không được phép truy cập",
    "auth.invalidToken": "Token hết hạn hoặc không hợp lệ",
    "auth.missingRequiredFields": "Thiếu trường bắt buộc",
    "auth.registerSuccess": "Đăng ký tài khoản thành công",
    "auth.emailExists": "Email đã được sử dụng",
    "auth.missingEmailOrPassword": "Thiếu email hoặc mật khẩu",
    "auth.loginSuccess": "Đăng nhập thành công",
    "auth.invalidCredentials": "Email hoặc mật khẩu không đúng",
    "auth.accountDisabled": "Tài khoản đã bị vô hiệu hóa",
    "auth.noRefreshToken": "Không có refresh token",
    "auth.invalidOrExpiredToken": "Token không hợp lệ hoặc đã hết hạn",
    "auth.refreshTokenRequired": "Cần refresh token",
    "auth.logoutSuccess": "Đăng xuất thành công",
    "account.notFound": "Không tìm thấy tài khoản",
    "account.deletedSuccess": "Xóa thành công",
    "category.notFound": "Không tìm thấy danh mục",
    "category.deletedSuccess": "Xóa thành công",
    "category.readOnly": "Không thể chỉnh sửa danh mục mặc định",
    "common.serverError": "Lỗi máy chủ",
    "validation.failed": "Dữ liệu không hợp lệ",
    "validation.required": "{field} là trường bắt buộc",
    "validation.mustBeNumber": "{field} phải là số",
    "validation.mustBeString": "{field} phải là chuỗi",
    "validation.invalidValue": "{field} không hợp lệ",
    "transaction.notFound": "Không tìm thấy giao dịch",
    "transaction.deletedSuccess": "Xóa thành công",
    "transaction.insufficientBalance": "Số dư không đủ",
    "transaction.missingMonth": "Thiếu tham số month",
    "transaction.invalidSummaryQuery":
      "Chỉ được dùng một kiểu lọc summary: month, year hoặc from/to",
    "transaction.invalidSummaryRange":
      "Phải truyền đồng thời from và to, và from phải nhỏ hơn hoặc bằng to",
  },
};

const fieldLabels: Record<string, Record<Language, string>> = {
  name: { en: "Name", vi: "Tên" },
  email: { en: "Email", vi: "Email" },
  password: { en: "Password", vi: "Mật khẩu" },
  refreshToken: { en: "Refresh token", vi: "Refresh token" },
  type: { en: "Type", vi: "Loại" },
  balance: { en: "Balance", vi: "Số dư" },
  initialAmount: { en: "Initial amount", vi: "Số tiền ban đầu" },
  interestRate: { en: "Interest rate", vi: "Lãi suất" },
  termMonths: { en: "Term months", vi: "Kỳ hạn (tháng)" },
  icon: { en: "Icon", vi: "Biểu tượng" },
  color: { en: "Color", vi: "Màu sắc" },
  month: { en: "Month", vi: "Tháng" },
  year: { en: "Year", vi: "Năm" },
  from: { en: "From", vi: "Từ ngày" },
  to: { en: "To", vi: "Đến ngày" },
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
