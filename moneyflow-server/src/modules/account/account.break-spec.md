# Account API - Break Spec (GWT Format)

## Scope

- Module: `src/modules/account`
- Test type: Unit test
- Source under test: `account.controller.ts`, `account.service.ts`
- Test artifacts: `account.controller.test.ts`, `account.service.test.ts`

## Test Matrix (Controller)

| ID | Function | Given | When | Then | Status |
| --- | --- | --- | --- | --- | --- |
| C-01 | `createAccount` | request has no `userId` | call handler | return `401 auth.notAuthorized` | Done |
| C-02 | `createAccount` | invalid payload | validate body | return `400` validation error | Done |
| C-03 | `createAccount` | valid payload | service resolves | return `201` + created account | Done |
| C-04 | `createAccount` | service throws `INSUFFICIENT_SOURCE_BALANCE` | catch error | return `400 account.insufficientSourceBalance` | Done |
| C-05 | `getAccounts` | authorized request | service resolves | return account list | Done |
| C-06 | `getAccountById` | account not found | service returns `null` | return `404 account.notFound` | Done |
| C-07 | `updateAccount` | invalid payload | validate body | return `400` validation error | Done |
| C-08 | `updateAccount` | account not found | service returns `null` | return `404 account.notFound` | Done |
| C-09 | `deleteAccount` | account exists | service resolves | return `200 account.deletedSuccess` | Done |
| C-10 | `settleAccount` | valid payload | service resolves | return settled account payload | Done |
| C-11 | `settleAccount` | service throws `SETTLEMENT_ACCOUNT_REQUIRED` | catch error | return `400 account.settlementAccountRequired` | Done |

## Test Matrix (Service)

| ID | Function | Given | When | Then | Status |
| --- | --- | --- | --- | --- | --- |
| S-01 | `createAccountService` | normal account + balance | create account | create initial-balance transaction + commit session | Done |
| S-02 | `createAccountService` | saving account + missing source account | create account | throw `SOURCE_ACCOUNT_NOT_FOUND` + abort session | Done |
| S-03 | `getAccountsService` | user has accounts | call service | settle due savings then return sorted list | Done |
| S-04 | `getAccountByIdService` | account exists | call service | settle due savings then return account | Done |
| S-05 | `updateAccountService` | account missing | update by id | return `null` + abort session | Done |
| S-06 | `updateAccountService` | account exists + new balance | update by id | sync initial balance transaction + commit session | Done |
| S-07 | `deleteAccountService` | account exists | delete by id | delete related transactions and account | Done |
| S-08 | `settleAccountService` | valid saving account | settle account | settle amount, save docs, commit session | Done |
| S-09 | `settleAccountService` | non-saving account | settle account | throw `SAVING_ACCOUNT_NOT_FOUND` + abort session | Done |
| S-10 | `settleDueSavingsForUser` | due savings exist for user | run settlement job | iterate and settle each due saving | Done |
| S-11 | `settleDueSavingsForAllUsers` | due savings exist globally | run settlement job | iterate and settle all due savings | Done |

## Quick Coverage Notes

- Covered all exported controller functions: 6/6
- Covered all exported service functions: 8/8
- Current execution result: 22 tests passed, 2 test suites passed
