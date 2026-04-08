import type { Transaction } from "@/types/transaction";

const readString = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const readObject = (value: unknown) =>
  value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;

const readId = (value: unknown) => {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  const record = readObject(value);
  if (!record) return "";

  const nestedId = record._id ?? record.id;
  return typeof nestedId === "string" || typeof nestedId === "number"
    ? String(nestedId)
    : "";
};

const readLocalizedText = (value: unknown) => {
  if (typeof value === "string") {
    return value.trim();
  }

  const record = readObject(value);
  if (!record) return "";

  const vi = readString(record.vi);
  const en = readString(record.en);

  return vi || en;
};

const readCategoryName = (value: unknown) => {
  const record = readObject(value);
  if (!record) return "";

  return readLocalizedText(record.name) || readString(record.label);
};

const normalizeDate = (value: unknown) => {
  const raw = readString(value);
  if (!raw) return "";

  return raw.includes("T") ? raw.slice(0, 10) : raw;
};

export const normalizeTransaction = (
  item: unknown,
  index = 0,
): Transaction => {
  const tx = readObject(item) ?? {};
  const amount = Number(tx.amount ?? 0);
  const note = readString(tx.note) || readString(tx.notes);
  const categoryId = readId(tx.categoryId);
  const walletId = readId(tx.walletId) || readId(tx.accountId);
  const category =
    readString(tx.category) ||
    readString(tx.categoryName) ||
    readCategoryName(tx.categoryId) ||
    "Other";

  return {
    id: readId(tx._id) || readId(tx.id) || String(index),
    name: readString(tx.title) || readString(tx.name) || note || category,
    description: readString(tx.description) || note,
    amount: Number.isFinite(amount) ? amount : 0,
    type: tx.type === "income" ? "income" : "expense",
    category,
    categoryId: categoryId || undefined,
    date: normalizeDate(tx.date ?? tx.createdAt),
    status: tx.status === "pending" ? "pending" : "completed",
    notes: note || undefined,
    walletId: walletId || undefined,
  };
};

export const normalizeTransactions = (data: unknown): Transaction[] => {
  if (!Array.isArray(data)) return [];

  return data.map((item, index) => normalizeTransaction(item, index));
};
