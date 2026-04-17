import mongoose from "mongoose";
import StockModel, { StockStatus } from "./stock.model";
import AccountModel from "../account/account.model";
import TransactionModel, { TransactionType } from "../transaction/transaction.model";
import CategoryModel, { CategoryType } from "../category/category.model";
import { CurrencyCode } from "../../shared/currency";

// ─── Tiêu đề transaction ────────────────────────────────────────────────────
const STOCK_BUY_TITLE = "Mua cổ phiếu";
const STOCK_SELL_PRINCIPAL_TITLE = "Hoàn gốc bán cổ phiếu";
const STOCK_SELL_PROFIT_TITLE = "Lãi đầu tư cổ phiếu";

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
/**
 * avgBuyPrice mới = (totalCostBasis + purchaseAmount) / (totalQty + quantity)
 */
const calcNewAvgPrice = (
  totalCostBasis: number,
  totalQty: number,
  purchaseAmount: number,
  addQty: number,
): number => {
  const newQty = totalQty + addQty;
  if (newQty === 0) return 0;
  return (totalCostBasis + purchaseAmount) / newQty;
};

// ─── CREATE — Tạo vị thế mới (lần mua đầu tiên của 1 mã) ────────────────────
export const createStockService = async (userId: string, data: any) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const quantity = Number(data.quantity);
    const buyPrice = Number(data.buyPrice);
    const purchaseAmount = Math.round(quantity * buyPrice);
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
            title: `${STOCK_BUY_TITLE} ${data.symbol ?? ""}`.trim(),
            note: `${STOCK_BUY_TITLE} ${data.symbol ?? ""}`.trim(),
          },
        ],
        { session },
      );

      transactionId = buyTx._id as mongoose.Types.ObjectId;
      accountId = sourceAccount._id as mongoose.Types.ObjectId;
    }

    const avgBuyPrice = buyPrice; // Lần đầu, avgBuyPrice = buyPrice
    const totalCostBasis = purchaseAmount;

    const [stock] = await StockModel.create(
      [
        {
          userId,
          symbol: data.symbol,
          currencyCode,
          totalQty: quantity,
          avgBuyPrice,
          totalCostBasis,
          primaryAccountId: accountId ?? undefined,
          status: StockStatus.HOLDING,
          buyLogs: [
            {
              _id: new mongoose.Types.ObjectId(),
              quantity,
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

    return StockModel.findById(stock._id).populate("primaryAccountId", "name type");
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// ─── BUY MORE — Mua thêm vào vị thế đã có, cập nhật giá bình quân ──────────
/**
 * Bình quân gia quyền:
 *   avgNew = (totalCostBasis + purchaseAmount) / (totalQty + quantity)
 *
 * Ví dụ:
 *   Hiện tại: 100 cp @ 50k → totalCostBasis=5M, totalQty=100
 *   Mua thêm: 200 cp @ 60k → purchaseAmount=12M
 *   avgNew = (5M + 12M) / (100 + 200) = 17M / 300 ≈ 56,667
 */
export const buyMoreStockService = async (
  userId: string,
  stockId: string,
  data: {
    quantity: number;
    buyPrice: number;
    buyDate?: string;
    accountId?: string;
  },
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const stock = await StockModel.findOne({ _id: stockId, userId }).session(session);
    if (!stock) throw new Error("STOCK_NOT_FOUND");
    if (stock.status === StockStatus.SOLD) throw new Error("STOCK_ALREADY_SOLD");

    const quantity = Number(data.quantity);
    const buyPrice = Number(data.buyPrice);
    const purchaseAmount = Math.round(quantity * buyPrice);
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
            currencyCode: stock.currencyCode,
            date: buyDate,
            title: `${STOCK_BUY_TITLE} ${stock.symbol}`,
            note: `${STOCK_BUY_TITLE} ${stock.symbol}`,
          },
        ],
        { session },
      );

      transactionId = buyTx._id as mongoose.Types.ObjectId;
      accountId = sourceAccount._id as mongoose.Types.ObjectId;
    }

    // Cập nhật giá bình quân
    const newAvgBuyPrice = calcNewAvgPrice(
      stock.totalCostBasis,
      stock.totalQty,
      purchaseAmount,
      quantity,
    );
    const newTotalQty = stock.totalQty + quantity;
    const newTotalCostBasis = Math.round(newAvgBuyPrice * newTotalQty);

    stock.totalQty = newTotalQty;
    stock.avgBuyPrice = newAvgBuyPrice;
    stock.totalCostBasis = newTotalCostBasis;

    // Ghi buyLog
    stock.buyLogs.push({
      _id: new mongoose.Types.ObjectId(),
      quantity,
      buyPrice,
      purchaseAmount,
      avgBuyPriceAfter: newAvgBuyPrice,
      buyDate,
      accountId: accountId ?? undefined,
      transactionId: transactionId ?? undefined,
    });

    await stock.save({ session });

    await session.commitTransaction();
    session.endSession();

    return StockModel.findById(stock._id).populate("primaryAccountId", "name type");
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// ─── SELL — Bán theo giá bình quân gia quyền ────────────────────────────────
/**
 * Khi bán `quantity` cp từ vị thế:
 *   avgCostBasis = quantity × avgBuyPrice (tại thời điểm bán)
 *   profit       = totalSellAmount - avgCostBasis
 *
 * Sau khi bán:
 *   totalQty     -= quantity
 *   totalCostBasis -= avgCostBasis
 *   avgBuyPrice  không đổi (tính chất của weighted avg cost)
 *
 * Transactions:
 *   - Có primaryAccountId: TRANSFER avgCostBasis + INCOME profit (nếu > 0)
 *   - Không có: INCOME totalSellAmount
 */
export const sellStockService = async (
  userId: string,
  stockId: string,
  data: {
    quantity: number;
    sellPrice: number;
    sellAccountId: string;
    sellDate?: string;
  },
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const stock = await StockModel.findOne({ _id: stockId, userId }).session(session);
    if (!stock) throw new Error("STOCK_NOT_FOUND");
    if (stock.status === StockStatus.SOLD) throw new Error("STOCK_ALREADY_SOLD");

    const sellQty = Number(data.quantity);
    if (sellQty <= 0) throw new Error("INVALID_SELL_QUANTITY");
    if (sellQty > stock.totalQty + 1e-9) throw new Error("INSUFFICIENT_STOCK_QUANTITY");

    const sellPrice = Number(data.sellPrice);
    const totalSellAmount = Math.round(sellQty * sellPrice);
    const avgCostBasis = Math.round(sellQty * stock.avgBuyPrice);
    const profit = totalSellAmount - avgCostBasis;
    const sellDate = data.sellDate ? new Date(data.sellDate) : new Date();

    const sellAccount = await AccountModel.findOne({
      _id: data.sellAccountId,
      userId,
    }).session(session);
    if (!sellAccount) throw new Error("SELL_ACCOUNT_NOT_FOUND");

    // Cộng tiền vào ví
    sellAccount.balance += totalSellAmount;
    await sellAccount.save({ session });

    let transferTransactionId: mongoose.Types.ObjectId | undefined;
    let incomeTransactionId: mongoose.Types.ObjectId | undefined;

    if (stock.primaryAccountId && avgCostBasis > 0) {
      // Có ví gốc → TRANSFER (hoàn vốn) + INCOME (lãi, nếu dương)
      const [transferTx] = await TransactionModel.create(
        [
          {
            userId,
            accountId: stock.primaryAccountId,
            toAccountId: sellAccount._id,
            type: TransactionType.TRANSFER,
            amount: avgCostBasis,
            currencyCode: stock.currencyCode,
            date: sellDate,
            title: `${STOCK_SELL_PRINCIPAL_TITLE} ${stock.symbol}`,
            note: `${STOCK_SELL_PRINCIPAL_TITLE} ${stock.symbol} (${sellQty} cp @ bình quân ${Math.round(stock.avgBuyPrice).toLocaleString()})`,
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
              currencyCode: stock.currencyCode,
              date: sellDate,
              title: `${STOCK_SELL_PROFIT_TITLE} ${stock.symbol}`,
              note: `${STOCK_SELL_PROFIT_TITLE} ${stock.symbol} (${sellQty} cp)`,
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
            currencyCode: stock.currencyCode,
            date: sellDate,
            title: `${STOCK_SELL_PROFIT_TITLE} ${stock.symbol}`,
            note: `${STOCK_SELL_PROFIT_TITLE} ${stock.symbol} (${sellQty} cp)`,
            categoryId: incomeCategory._id,
            isInvestmentReturn: true,
          },
        ],
        { session },
      );
      incomeTransactionId = incomeTx._id as mongoose.Types.ObjectId;
    }

    // Ghi sellLog
    stock.sellLogs.push({
      _id: new mongoose.Types.ObjectId(),
      quantity: sellQty,
      sellPrice,
      totalSellAmount,
      avgCostBasis,
      profit,
      sellDate,
      sellAccountId: sellAccount._id as mongoose.Types.ObjectId,
      transferTransactionId,
      incomeTransactionId,
    });

    // Cập nhật vị thế — avgBuyPrice KHÔNG thay đổi sau khi bán (tính chất bình quân)
    const newTotalQty = parseFloat((stock.totalQty - sellQty).toFixed(10));
    stock.totalQty = newTotalQty;
    stock.totalCostBasis = Math.round(newTotalQty * stock.avgBuyPrice);
    stock.status = newTotalQty <= 1e-9 ? StockStatus.SOLD : StockStatus.HOLDING;
    await stock.save({ session });

    await session.commitTransaction();
    session.endSession();

    return StockModel.findById(stock._id).populate("primaryAccountId", "name type");
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// ─── GET LIST ────────────────────────────────────────────────────────────────
export const getStockService = async (userId: string, query: any) => {
  const filter: Record<string, unknown> = { userId };
  if (query.status) filter.status = query.status;
  if (query.symbol) filter.symbol = String(query.symbol).toUpperCase();

  return StockModel.find(filter)
    .sort({ createdAt: -1 })
    .populate("primaryAccountId", "name type");
};

// ─── GET BY ID ───────────────────────────────────────────────────────────────
export const getStockByIdService = async (userId: string, stockId: string) => {
  return StockModel.findOne({ _id: stockId, userId }).populate(
    "primaryAccountId",
    "name type",
  );
};

// ─── DELETE — Chỉ xóa được vị thế chưa có bất kỳ giao dịch bán nào ─────────
export const deleteStockService = async (userId: string, stockId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const stock = await StockModel.findOne({ _id: stockId, userId }).session(session);
    if (!stock) throw new Error("STOCK_NOT_FOUND");
    if (stock.sellLogs.length > 0) throw new Error("STOCK_PARTIALLY_SOLD");

    // Hoàn lại số dư ví cho tất cả các lần mua đã trừ
    for (const log of stock.buyLogs) {
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

    await stock.deleteOne({ session });

    await session.commitTransaction();
    session.endSession();
    return true;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
