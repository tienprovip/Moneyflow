import mongoose from "mongoose";
import GoldModel, { GoldStatus, GoldType } from "./gold.model";
import AccountModel from "../account/account.model";
import TransactionModel, { TransactionType } from "../transaction/transaction.model";
import CategoryModel, { CategoryType } from "../category/category.model";
import { CurrencyCode } from "../../shared/currency";

// ─── Tiêu đề transaction ────────────────────────────────────────────────────
const GOLD_BUY_TITLE = "Mua vàng";
const GOLD_SELL_PRINCIPAL_TITLE = "Hoàn gốc bán vàng";
const GOLD_SELL_PROFIT_TITLE = "Lãi đầu tư vàng";

// ─── Helper: lấy / tạo category đầu tư ─────────────────────────────────────
const findOrCreateInvestmentIncomeCategory = async (
  userId: string,
  session: mongoose.ClientSession,
) => {
  const existing = await CategoryModel.findOne({
    type: CategoryType.INCOME,
    $or: [
      { userId, isDefault: false },
      { isDefault: true },
    ],
    $and: [
      {
        $or: [
          { "name.vi": { $regex: /đầu tư|lãi/i } },
          { "name.en": { $regex: /invest|return|profit/i } },
        ],
      },
    ],
  }).session(session);

  if (existing) return existing;

  const [created] = await CategoryModel.create(
    [
      {
        userId,
        type: CategoryType.INCOME,
        name: { en: "Investment return", vi: "Lãi đầu tư" },
        icon: "TrendingUp",
        color: "bg-emerald-100 text-emerald-700",
        isDefault: false,
      },
    ],
    { session },
  );
  return created;
};

// ─── Helper: tính giá bình quân gia quyền ───────────────────────────────────
const calcNewAvgPrice = (
  totalCostBasis: number,
  totalWeight: number,
  purchaseAmount: number,
  addWeight: number,
): number => {
  const newWeight = totalWeight + addWeight;
  if (newWeight === 0) return 0;
  return (totalCostBasis + purchaseAmount) / newWeight;
};

// ─── CREATE — Tạo vị thế mới (lần mua đầu tiên của 1 loại vàng) ─────────────
export const createGoldService = async (userId: string, data: any) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const weight = Number(data.weight);
    const buyPrice = Number(data.buyPrice);
    const purchaseAmount = Math.round(weight * buyPrice);
    const buyDate = data.buyDate ? new Date(data.buyDate) : new Date();
    const currencyCode = data.currencyCode ?? CurrencyCode.VND;

    let transactionId: mongoose.Types.ObjectId | undefined;
    let accountId: mongoose.Types.ObjectId | undefined;

    if (data.sourceAccountId) {
      const sourceAccount = await AccountModel.findOne({
        _id: data.sourceAccountId,
        userId,
      }).session(session);

      if (!sourceAccount) throw new Error("SOURCE_ACCOUNT_NOT_FOUND");
      if (Number(sourceAccount.balance ?? 0) < purchaseAmount) {
        throw new Error("INSUFFICIENT_SOURCE_BALANCE");
      }

      sourceAccount.balance -= purchaseAmount;
      await sourceAccount.save({ session });

      const [buyTx] = await TransactionModel.create(
        [
          {
            userId,
            accountId: sourceAccount._id,
            type: TransactionType.EXPENSE,
            amount: purchaseAmount,
            currencyCode,
            date: buyDate,
            title: GOLD_BUY_TITLE,
            note: GOLD_BUY_TITLE,
          },
        ],
        { session },
      );

      transactionId = buyTx._id as mongoose.Types.ObjectId;
      accountId = sourceAccount._id as mongoose.Types.ObjectId;
    }

    const avgBuyPrice = buyPrice;
    const totalCostBasis = purchaseAmount;

    const [gold] = await GoldModel.create(
      [
        {
          userId,
          goldType: data.goldType ?? GoldType.GOLD_SJC,
          currencyCode,
          totalWeight: weight,
          avgBuyPrice,
          totalCostBasis,
          primaryAccountId: accountId ?? undefined,
          note: data.note ?? undefined,
          status: GoldStatus.HOLDING,
          buyLogs: [
            {
              _id: new mongoose.Types.ObjectId(),
              weight,
              buyPrice,
              purchaseAmount,
              avgBuyPriceAfter: avgBuyPrice,
              buyDate,
              accountId: accountId ?? undefined,
              transactionId: transactionId ?? undefined,
            },
          ],
          sellLogs: [],
        },
      ],
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    return GoldModel.findById(gold._id).populate("primaryAccountId", "name type");
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// ─── BUY MORE — Mua thêm vào vị thế đã có, cập nhật giá bình quân ──────────
/**
 * avgNew = (totalCostBasis + purchaseAmount) / (totalWeight + weight)
 *
 * Ví dụ: 4 chỉ 999.9 @ 17M, mua thêm 3 chỉ 999.9 @ 14M
 *   avgNew = (68M + 42M) / 7 ≈ 15,714,286 đ/chỉ
 */
export const buyMoreGoldService = async (
  userId: string,
  goldId: string,
  data: {
    weight: number;
    buyPrice: number;
    buyDate?: string;
    accountId?: string;
  },
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const gold = await GoldModel.findOne({ _id: goldId, userId }).session(session);
    if (!gold) throw new Error("GOLD_NOT_FOUND");
    if (gold.status === GoldStatus.SOLD) throw new Error("GOLD_ALREADY_SOLD");

    const weight = Number(data.weight);
    const buyPrice = Number(data.buyPrice);
    const purchaseAmount = Math.round(weight * buyPrice);
    const buyDate = data.buyDate ? new Date(data.buyDate) : new Date();

    let transactionId: mongoose.Types.ObjectId | undefined;
    let accountId: mongoose.Types.ObjectId | undefined;

    if (data.accountId) {
      const sourceAccount = await AccountModel.findOne({
        _id: data.accountId,
        userId,
      }).session(session);

      if (!sourceAccount) throw new Error("SOURCE_ACCOUNT_NOT_FOUND");
      if (Number(sourceAccount.balance ?? 0) < purchaseAmount) {
        throw new Error("INSUFFICIENT_SOURCE_BALANCE");
      }

      sourceAccount.balance -= purchaseAmount;
      await sourceAccount.save({ session });

      const [buyTx] = await TransactionModel.create(
        [
          {
            userId,
            accountId: sourceAccount._id,
            type: TransactionType.EXPENSE,
            amount: purchaseAmount,
            currencyCode: gold.currencyCode,
            date: buyDate,
            title: GOLD_BUY_TITLE,
            note: GOLD_BUY_TITLE,
          },
        ],
        { session },
      );

      transactionId = buyTx._id as mongoose.Types.ObjectId;
      accountId = sourceAccount._id as mongoose.Types.ObjectId;
    }

    // Cập nhật giá bình quân
    const newAvgBuyPrice = calcNewAvgPrice(
      gold.totalCostBasis,
      gold.totalWeight,
      purchaseAmount,
      weight,
    );
    const newTotalWeight = gold.totalWeight + weight;
    const newTotalCostBasis = Math.round(newAvgBuyPrice * newTotalWeight);

    gold.totalWeight = newTotalWeight;
    gold.avgBuyPrice = newAvgBuyPrice;
    gold.totalCostBasis = newTotalCostBasis;

    gold.buyLogs.push({
      _id: new mongoose.Types.ObjectId(),
      weight,
      buyPrice,
      purchaseAmount,
      avgBuyPriceAfter: newAvgBuyPrice,
      buyDate,
      accountId: accountId ?? undefined,
      transactionId: transactionId ?? undefined,
    });

    await gold.save({ session });

    await session.commitTransaction();
    session.endSession();

    return GoldModel.findById(gold._id).populate("primaryAccountId", "name type");
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// ─── SELL — Bán theo giá bình quân ─────────────────────────────────────────
/**
 * Bán `weight` chỉ từ vị thế:
 *   avgCostBasis  = weight × avgBuyPrice
 *   profit        = totalSellAmount - avgCostBasis
 *   avgBuyPrice không đổi sau khi bán
 *
 * Ví dụ: 7 chỉ 999.9, avgBuyPrice = 15,714,286. Bán 1 chỉ @ 22M:
 *   avgCostBasis  = 1 × 15,714,286 ≈ 15,714,286
 *   profit        = 22,000,000 - 15,714,286 = 6,285,714
 *
 *   TRANSFER  15,714,286  (hoàn vốn bình quân về ví)
 *   INCOME     6,285,714  (Lãi đầu tư vàng)
 */
export const sellGoldService = async (
  userId: string,
  goldId: string,
  data: {
    weight: number;
    sellPrice: number;
    sellAccountId: string;
    sellDate?: string;
  },
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const gold = await GoldModel.findOne({ _id: goldId, userId }).session(session);
    if (!gold) throw new Error("GOLD_NOT_FOUND");
    if (gold.status === GoldStatus.SOLD) throw new Error("GOLD_ALREADY_SOLD");

    const sellWeight = Number(data.weight);
    if (sellWeight <= 0) throw new Error("INVALID_SELL_WEIGHT");
    if (sellWeight > gold.totalWeight + 1e-9) throw new Error("INSUFFICIENT_GOLD_WEIGHT");

    const sellPrice = Number(data.sellPrice);
    const totalSellAmount = Math.round(sellWeight * sellPrice);
    const avgCostBasis = Math.round(sellWeight * gold.avgBuyPrice);
    const profit = totalSellAmount - avgCostBasis;
    const sellDate = data.sellDate ? new Date(data.sellDate) : new Date();

    const sellAccount = await AccountModel.findOne({
      _id: data.sellAccountId,
      userId,
    }).session(session);
    if (!sellAccount) throw new Error("SELL_ACCOUNT_NOT_FOUND");

    sellAccount.balance += totalSellAmount;
    await sellAccount.save({ session });

    let transferTransactionId: mongoose.Types.ObjectId | undefined;
    let incomeTransactionId: mongoose.Types.ObjectId | undefined;

    if (gold.primaryAccountId && avgCostBasis > 0) {
      // Có ví gốc → TRANSFER (hoàn vốn bình quân) + INCOME (lãi, nếu dương)
      const [transferTx] = await TransactionModel.create(
        [
          {
            userId,
            accountId: gold.primaryAccountId,
            toAccountId: sellAccount._id,
            type: TransactionType.TRANSFER,
            amount: avgCostBasis,
            currencyCode: gold.currencyCode,
            date: sellDate,
            title: GOLD_SELL_PRINCIPAL_TITLE,
            note: `${GOLD_SELL_PRINCIPAL_TITLE} (${sellWeight} chỉ @ bình quân ${Math.round(gold.avgBuyPrice).toLocaleString()})`,
          },
        ],
        { session },
      );
      transferTransactionId = transferTx._id as mongoose.Types.ObjectId;

      if (profit > 0) {
        const incomeCategory = await findOrCreateInvestmentIncomeCategory(userId, session);
        const [incomeTx] = await TransactionModel.create(
          [
            {
              userId,
              accountId: sellAccount._id,
              type: TransactionType.INCOME,
              amount: profit,
              currencyCode: gold.currencyCode,
              date: sellDate,
              title: GOLD_SELL_PROFIT_TITLE,
              note: `${GOLD_SELL_PROFIT_TITLE} (${sellWeight} chỉ)`,
              categoryId: incomeCategory._id,
              isInvestmentReturn: true,
            },
          ],
          { session },
        );
        incomeTransactionId = incomeTx._id as mongoose.Types.ObjectId;
      }
    } else {
      // Không có ví gốc → toàn bộ là INCOME
      const incomeCategory = await findOrCreateInvestmentIncomeCategory(userId, session);
      const [incomeTx] = await TransactionModel.create(
        [
          {
            userId,
            accountId: sellAccount._id,
            type: TransactionType.INCOME,
            amount: totalSellAmount,
            currencyCode: gold.currencyCode,
            date: sellDate,
            title: GOLD_SELL_PROFIT_TITLE,
            note: `${GOLD_SELL_PROFIT_TITLE} (${sellWeight} chỉ)`,
            categoryId: incomeCategory._id,
            isInvestmentReturn: true,
          },
        ],
        { session },
      );
      incomeTransactionId = incomeTx._id as mongoose.Types.ObjectId;
    }

    // Ghi sellLog
    gold.sellLogs.push({
      _id: new mongoose.Types.ObjectId(),
      weight: sellWeight,
      sellPrice,
      totalSellAmount,
      avgCostBasis,
      profit,
      sellDate,
      sellAccountId: sellAccount._id as mongoose.Types.ObjectId,
      transferTransactionId,
      incomeTransactionId,
    });

    // Cập nhật vị thế — avgBuyPrice KHÔNG thay đổi sau khi bán
    const newTotalWeight = parseFloat((gold.totalWeight - sellWeight).toFixed(10));
    gold.totalWeight = newTotalWeight;
    gold.totalCostBasis = Math.round(newTotalWeight * gold.avgBuyPrice);
    gold.status = newTotalWeight <= 1e-9 ? GoldStatus.SOLD : GoldStatus.HOLDING;
    await gold.save({ session });

    await session.commitTransaction();
    session.endSession();

    return GoldModel.findById(gold._id).populate("primaryAccountId", "name type");
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// ─── GET LIST ────────────────────────────────────────────────────────────────
export const getGoldService = async (userId: string, query: any) => {
  const filter: Record<string, unknown> = { userId };
  if (query.status) filter.status = query.status;
  if (query.goldType) filter.goldType = query.goldType;

  return GoldModel.find(filter)
    .sort({ createdAt: -1 })
    .populate("primaryAccountId", "name type");
};

// ─── GET BY ID ───────────────────────────────────────────────────────────────
export const getGoldByIdService = async (userId: string, goldId: string) => {
  return GoldModel.findOne({ _id: goldId, userId }).populate(
    "primaryAccountId",
    "name type",
  );
};

// ─── DELETE — Chỉ xóa được vị thế chưa có bất kỳ giao dịch bán nào ─────────
export const deleteGoldService = async (userId: string, goldId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const gold = await GoldModel.findOne({ _id: goldId, userId }).session(session);
    if (!gold) throw new Error("GOLD_NOT_FOUND");
    if (gold.sellLogs.length > 0) throw new Error("GOLD_PARTIALLY_SOLD");

    // Hoàn lại số dư ví cho tất cả các lần mua đã trừ
    for (const log of gold.buyLogs) {
      if (!log.accountId || !log.transactionId) continue;

      const account = await AccountModel.findOne({
        _id: log.accountId,
        userId,
      }).session(session);

      if (account) {
        account.balance += log.purchaseAmount;
        await account.save({ session });
      }

      await TransactionModel.deleteOne({ _id: log.transactionId }, { session });
    }

    await gold.deleteOne({ session });

    await session.commitTransaction();
    session.endSession();
    return true;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
