import mongoose, { Schema, Document } from "mongoose";
import { CurrencyCode } from "../../shared/currency";

export enum GoldType {
  SJC9999 = "SJC9999",       // Vàng miếng SJC
  KGB = "KGB",               // Nhẫn Tròn ép vỉ Kim Gia Bảo 24K (999.9)
  GOLD_9999 = "9999",        // Vàng trang sức 24K (999.9)
  GOLD_999 = "999",          // Vàng trang sức 24K (99.9)
  NL9999 = "NL9999",         // Vàng nguyên liệu 999.9
  NL999 = "NL999",           // Vàng nguyên liệu 99.9
}

export enum GoldStatus {
  HOLDING = "holding", // Đang nắm giữ
  SOLD = "sold",       // Đã bán hết
}

// ─── Mỗi lần mua thêm vào vị thế ───────────────────────────────────────────
export interface IGoldBuyLog {
  _id: mongoose.Types.ObjectId;
  weight: number;           // Trọng lượng mua lần này
  buyPrice: number;         // Giá mua mỗi đơn vị lần này
  purchaseAmount: number;   // weight × buyPrice
  avgBuyPriceAfter: number; // Giá bình quân sau lần mua này
  buyDate: Date;
  accountId?: mongoose.Types.ObjectId;     // Ví đã dùng
  transactionId?: mongoose.Types.ObjectId; // Ref EXPENSE transaction
}

// ─── Mỗi lần bán (tính theo bình quân gia quyền) ────────────────────────────
export interface IGoldSellLog {
  _id: mongoose.Types.ObjectId;
  weight: number;           // Trọng lượng bán lần này
  sellPrice: number;        // Giá bán mỗi đơn vị
  totalSellAmount: number;  // weight × sellPrice
  avgCostBasis: number;     // weight × avgBuyPrice tại thời điểm bán
  profit: number;           // totalSellAmount - avgCostBasis
  sellDate: Date;
  sellAccountId: mongoose.Types.ObjectId;
  incomeTransactionId?: mongoose.Types.ObjectId;
}

const GoldBuyLogSchema = new Schema<IGoldBuyLog>(
  {
    weight: { type: Number, required: true },
    buyPrice: { type: Number, required: true },
    purchaseAmount: { type: Number, required: true },
    avgBuyPriceAfter: { type: Number, required: true },
    buyDate: { type: Date, required: true },
    accountId: { type: Schema.Types.ObjectId, ref: "Account" },
    transactionId: { type: Schema.Types.ObjectId, ref: "Transaction" },
  },
  { _id: true },
);

const GoldSellLogSchema = new Schema<IGoldSellLog>(
  {
    weight: { type: Number, required: true },
    sellPrice: { type: Number, required: true },
    totalSellAmount: { type: Number, required: true },
    avgCostBasis: { type: Number, required: true },
    profit: { type: Number, required: true },
    sellDate: { type: Date, required: true },
    sellAccountId: { type: Schema.Types.ObjectId, ref: "Account", required: true },
    incomeTransactionId: { type: Schema.Types.ObjectId, ref: "Transaction" },
  },
  { _id: true },
);

// ─── Vị thế vàng theo từng loại ──────────────────────────────────────────────
export interface IGold extends Document {
  userId: mongoose.Types.ObjectId;
  goldType: GoldType;
  currencyCode: CurrencyCode;

  // Trạng thái hiện tại (cập nhật liên tục sau mua/bán)
  totalWeight: number;     // Tổng trọng lượng đang nắm giữ
  avgBuyPrice: number;     // Giá bình quân gia quyền hiện tại
  totalCostBasis: number;  // = totalWeight × avgBuyPrice

  // Ví chính dùng cho TRANSFER khi bán (ví của lần mua đầu tiên)
  primaryAccountId?: mongoose.Types.ObjectId;
  note?: string;  // Ghi chú nơi mua, thương hiệu, v.v.

  status: GoldStatus;

  // Lịch sử mua / bán
  buyLogs: IGoldBuyLog[];
  sellLogs: IGoldSellLog[];

  createdAt: Date;
  updatedAt: Date;
}

const GoldSchema = new Schema<IGold>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    goldType: {
      type: String,
      enum: Object.values(GoldType),
      required: true,
      index: true,
    },

    currencyCode: {
      type: String,
      enum: Object.values(CurrencyCode),
      default: CurrencyCode.VND,
    },

    totalWeight: { type: Number, required: true, default: 0 },
    avgBuyPrice: { type: Number, required: true, default: 0 },
    totalCostBasis: { type: Number, required: true, default: 0 },

    primaryAccountId: { type: Schema.Types.ObjectId, ref: "Account" },
    note: { type: String, trim: true },

    status: {
      type: String,
      enum: Object.values(GoldStatus),
      default: GoldStatus.HOLDING,
    },

    buyLogs: { type: [GoldBuyLogSchema], default: [] },
    sellLogs: { type: [GoldSellLogSchema], default: [] },
  },
  { timestamps: true },
);

export default mongoose.model<IGold>("Gold", GoldSchema);
