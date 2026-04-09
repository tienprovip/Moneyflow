const walletTransactionsKey = ["wallet-transactions"] as const;

export const queryKeys = {
  categories: ["categories"] as const,
  transactions: ["transactions"] as const,
  walletTransactions: walletTransactionsKey,
  walletTransactionsById: (walletId: string) =>
    [...walletTransactionsKey, walletId] as const,
  wallets: ["wallets"] as const,
};
