import mongoose, { Schema, Document } from "mongoose";
import { CurrencyCode } from "../../shared/currency";

export enum StockStatus {
  HOLDING = "holding", // Đang nắm giữ
  SOLD = "sold",       // Đã bán hết
}

// ─── Mỗi lần mua thêm vào vị thế ───────────────────────────────────────────
export interface IStockBuyLog {
  _id: mongoose.Types.ObjectId;
  quantity: number;         // Số lượng mua lần này
  buyPrice: number;         // Giá mua mỗi cp lần này
  purchaseAmount: number;   // quantity × buyPrice
  avgBuyPriceAfter: number; // Giá bình quân sau lần mua này
  buyDate: Date;
  accountId?: mongoose.Types.ObjectId;      // Ví đã dùng để mua
  transactionId?: mongoose.Types.ObjectId;  // Ref EXPENSE transaction
}

// ─── Mỗi lần bán (tính theo bình quân gia quyền) ────────────────────────────
export interface IStockSellLog {
  _id: mongoose.Types.ObjectId;
  quantity: number;           // Số cp bán lần này
  sellPrice: number;          // Giá bán mỗi cp
  totalSellAmount: number;    // quantity × sellPrice
  avgCostBasis: number;       // quantity × avgBuyPrice tại thời điểm bán
  profit: number;             // totalSellAmount - avgCostBasis
  sellDate: Date;
  sellAccountId: mongoose.Types.ObjectId;     // Ví nhận tiền
  transferTransactionId?: mongoose.Types.ObjectId;
  incomeTransactionId?: mongoose.Types.ObjectId;
}

const StockBuyLogSchema = new Schema<IStockBuyLog>(
  {
    quantity: { type: Number, required: true },
    buyPrice: { type: Number, required: true },
    purchaseAmount: { type: Number, required: true },
    avgBuyPriceAfter: { type: Number, required: true },
    buyDate: { type: Date, required: true },
    accountId: { type: Schema.Types.ObjectId, ref: "Account" },
    transactionId: { type: Schema.Types.ObjectId, ref: "Transaction" },
  },
  { _id: true },
);

const StockSellLogSchema = new Schema<IStockSellLog>(
  {
    quantity: { type: Number, required: true },
    sellPrice: { type: Number, required: true },
    totalSellAmount: { type: Number, required: true },
    avgCostBasis: { type: Number, required: true },
    profit: { type: Number, required: true },
    sellDate: { type: Date, required: true },
    sellAccountId: { type: Schema.Types.ObjectId, ref: "Account", required: true },
    transferTransactionId: { type: Schema.Types.ObjectId, ref: "Transaction" },
    incomeTransactionId: { type: Schema.Types.ObjectId, ref: "Transaction" },
  },
  { _id: true },
);

// ─── Vị thế cổ phiếu (1 record = 1 mã CK của user) ─────────────────────────
export interface IStock extends Document {
  userId: mongoose.Types.ObjectId;
  symbol: string;
  currencyCode: CurrencyCode;

  // Trạng thái hiện tại (cập nhật liên tục sau mua/bán)
  totalQty: number;        // Số cp đang nắm giữ
  avgBuyPrice: number;     // Giá bình quân gia quyền hiện tại
  totalCostBasis: number;  // = totalQty × avgBuyPrice

  // Ví chính dùng cho TRANSFER khi bán (ví của lần mua đầu tiên)
  primaryAccountId?: mongoose.Types.ObjectId;

  status: StockStatus;

  // Lịch sử mua / bán
  buyLogs: IStockBuyLog[];
  sellLogs: IStockSellLog[];

  createdAt: Date;
  updatedAt: Date;
}

const StockSchema = new Schema<IStock>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    currencyCode: {
      type: String,
      enum: Object.values(CurrencyCode),
      default: CurrencyCode.VND,
    },

    totalQty: { type: Number, required: true, default: 0 },
    avgBuyPrice: { type: Number, required: true, default: 0 },
    totalCostBasis: { type: Number, required: true, default: 0 },

    primaryAccountId: { type: Schema.Types.ObjectId, ref: "Account" },

    status: {
      type: String,
      enum: Object.values(StockStatus),
      default: StockStatus.HOLDING,
    },

    buyLogs: { type: [StockBuyLogSchema], default: [] },
    sellLogs: { type: [StockSellLogSchema], default: [] },
  },
  { timestamps: true },
);

export default mongoose.model<IStock>("Stock", StockSchema);
