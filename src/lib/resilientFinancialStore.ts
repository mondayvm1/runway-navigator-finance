import type { AccountData } from '@/hooks/useFinancialData';

const STORE_VERSION = 1;
const KEY_PREFIX = 'pathline_resilient_financial_data';

export interface ResilientFinancialData {
  version: number;
  accountData: AccountData;
  monthlyExpenses: number;
  savedAt: string;
  pendingSync: boolean;
}

export const dedupeAccountData = (accountData: AccountData): AccountData => {
  const dedupe = <T extends { id: string }>(accounts: T[]) => {
    const byId = new Map<string, T>();
    accounts.forEach(account => byId.set(account.id, account));
    return [...byId.values()];
  };

  return {
    cash: dedupe(accountData.cash || []),
    investments: dedupe(accountData.investments || []),
    credit: dedupe(accountData.credit || []),
    loans: dedupe(accountData.loans || []),
    otherAssets: dedupe(accountData.otherAssets || []),
  };
};

const storageKey = (userId: string) => `${KEY_PREFIX}:${userId}`;

export const loadResilientFinancialData = (userId: string): ResilientFinancialData | null => {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as ResilientFinancialData;
    if (parsed.version !== STORE_VERSION || !parsed.accountData) return null;
    return {
      ...parsed,
      accountData: dedupeAccountData(parsed.accountData),
    };
  } catch (error) {
    console.error('Unable to read the local Pathline fallback:', error);
    return null;
  }
};

export const saveResilientFinancialData = (
  userId: string,
  accountData: AccountData,
  monthlyExpenses: number,
  pendingSync: boolean,
) => {
  const record: ResilientFinancialData = {
    version: STORE_VERSION,
    accountData: dedupeAccountData(accountData),
    monthlyExpenses,
    savedAt: new Date().toISOString(),
    pendingSync,
  };

  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(record));
  } catch (error) {
    console.error('Unable to save the local Pathline fallback:', error);
  }
};
