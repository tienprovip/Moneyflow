import * as controller from "./account.controller";
import * as accountService from "./account.service";
import {
  createAccountSchema,
  settleAccountSchema,
  updateAccountSchema,
} from "./account.validation";
import { buildValidationError, t } from "../../i18n";

jest.mock("./account.service", () => ({
  __esModule: true,
  createAccountService: jest.fn(),
  getAccountsService: jest.fn(),
  getAccountByIdService: jest.fn(),
  updateAccountService: jest.fn(),
  deleteAccountService: jest.fn(),
  settleAccountService: jest.fn(),
}));

jest.mock("./account.validation", () => ({
  __esModule: true,
  createAccountSchema: { safeParse: jest.fn() },
  updateAccountSchema: { safeParse: jest.fn() },
  settleAccountSchema: { safeParse: jest.fn() },
}));

jest.mock("../../i18n", () => ({
  __esModule: true,
  t: jest.fn((_req, key) => key),
  buildValidationError: jest.fn(() => ({ message: "validation_error" })),
}));

const makeReq = (overrides: any = {}) =>
  ({
    userId: "user-1",
    body: {},
    params: {},
    ...overrides,
  }) as any;

const makeRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("account.controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("createAccount returns 401 when missing userId", async () => {
    const req = makeReq({ userId: undefined });
    const res = makeRes();

    await controller.createAccount(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "auth.notAuthorized" });
  });

  it("createAccount returns 400 on validation error", async () => {
    const req = makeReq({ body: { bad: true } });
    const res = makeRes();
    (createAccountSchema.safeParse as jest.Mock).mockReturnValue({
      success: false,
      error: { issues: [] },
    });

    await controller.createAccount(req, res);

    expect(buildValidationError).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("createAccount returns 201 on success", async () => {
    const req = makeReq({ body: { name: "Wallet" } });
    const res = makeRes();
    (createAccountSchema.safeParse as jest.Mock).mockReturnValue({
      success: true,
      data: { name: "Wallet" },
    });
    (accountService.createAccountService as jest.Mock).mockResolvedValue({
      _id: "acc-1",
    });

    await controller.createAccount(req, res);

    expect(accountService.createAccountService).toHaveBeenCalledWith("user-1", {
      name: "Wallet",
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("createAccount maps business errors to 400", async () => {
    const req = makeReq();
    const res = makeRes();
    (createAccountSchema.safeParse as jest.Mock).mockReturnValue({
      success: true,
      data: {},
    });
    (accountService.createAccountService as jest.Mock).mockRejectedValue(
      new Error("INSUFFICIENT_SOURCE_BALANCE"),
    );

    await controller.createAccount(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(t).toHaveBeenCalledWith(req, "account.insufficientSourceBalance");
  });

  it("getAccounts returns data", async () => {
    const req = makeReq();
    const res = makeRes();
    (accountService.getAccountsService as jest.Mock).mockResolvedValue([
      { _id: "acc-1" },
    ]);

    await controller.getAccounts(req, res);

    expect(res.json).toHaveBeenCalledWith([{ _id: "acc-1" }]);
  });

  it("getAccountById returns 404 when not found", async () => {
    const req = makeReq({ params: { id: "acc-1" } });
    const res = makeRes();
    (accountService.getAccountByIdService as jest.Mock).mockResolvedValue(null);

    await controller.getAccountById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "account.notFound" });
  });

  it("updateAccount returns 400 on invalid payload", async () => {
    const req = makeReq({ params: { id: "acc-1" } });
    const res = makeRes();
    (updateAccountSchema.safeParse as jest.Mock).mockReturnValue({
      success: false,
      error: { issues: [] },
    });

    await controller.updateAccount(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("updateAccount returns 404 when service returns null", async () => {
    const req = makeReq({ params: { id: "acc-1" } });
    const res = makeRes();
    (updateAccountSchema.safeParse as jest.Mock).mockReturnValue({
      success: true,
      data: { name: "new" },
    });
    (accountService.updateAccountService as jest.Mock).mockResolvedValue(null);

    await controller.updateAccount(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("deleteAccount returns success message", async () => {
    const req = makeReq({ params: { id: "acc-1" } });
    const res = makeRes();
    (accountService.deleteAccountService as jest.Mock).mockResolvedValue({
      _id: "acc-1",
    });

    await controller.deleteAccount(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "account.deletedSuccess",
    });
  });

  it("settleAccount validates payload and calls service", async () => {
    const req = makeReq({ params: { id: "saving-1" }, body: {} });
    const res = makeRes();
    (settleAccountSchema.safeParse as jest.Mock).mockReturnValue({
      success: true,
      data: {},
    });
    (accountService.settleAccountService as jest.Mock).mockResolvedValue({
      _id: "saving-1",
    });

    await controller.settleAccount(req, res);

    expect(accountService.settleAccountService).toHaveBeenCalledWith(
      "user-1",
      "saving-1",
      {},
    );
    expect(res.json).toHaveBeenCalledWith({ _id: "saving-1" });
  });

  it("settleAccount maps domain errors", async () => {
    const req = makeReq({ params: { id: "saving-1" }, body: {} });
    const res = makeRes();
    (settleAccountSchema.safeParse as jest.Mock).mockReturnValue({
      success: true,
      data: {},
    });
    (accountService.settleAccountService as jest.Mock).mockRejectedValue(
      new Error("SETTLEMENT_ACCOUNT_REQUIRED"),
    );

    await controller.settleAccount(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "account.settlementAccountRequired",
    });
  });
});
