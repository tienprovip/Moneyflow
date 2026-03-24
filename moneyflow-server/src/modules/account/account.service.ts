import AccountModel, { AccountType } from "./account.model";

export const createAccountService = async (userId: string, data: any) => {
  const accountData: any = {
    userId,
    name: data.name,
    type: data.type,
    balance: data.balance || 0,
  };

  if (data.type === AccountType.SAVING) {
    accountData.initialAmount = data.initialAmount || 0;
    accountData.interestRate = data.interestRate || 0;
    accountData.termMonths = data.termMonths || 0;
    accountData.startDate = new Date();
    if (data.termMonths) {
      const maturityDate = new Date();
      maturityDate.setMonth(maturityDate.getMonth() + data.termMonths);
      accountData.maturityDate = maturityDate;
    }
  }

  return await AccountModel.create(accountData);
};

export const getAccountsService = async (userId: string) => {
  return await AccountModel.find({ userId }).sort({ createdAt: -1 });
};

export const getAccountByIdService = async (
  userId: string,
  accountId: string,
) => {
  return await AccountModel.findOne({
    _id: accountId,
    userId,
  });
};

export const updateAccountService = async (
  userId: string,
  accountId: string,
  data: any,
) => {
  return await AccountModel.findOneAndUpdate({ _id: accountId, userId }, data, {
    new: true,
  });
};

export const deleteAccountService = async (
  userId: string,
  accountId: string,
) => {
  return await AccountModel.findOneAndDelete({
    _id: accountId,
    userId,
  });
};
