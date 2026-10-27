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

const storageKey = (userId: string) => `${KEY_PREFIX}:${userId}`;

export const loadResilientFinancialData = (userId: string): ResilientFinancialData | null => {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as ResilientFinancialData;
    if (parsed.version !== STORE_VERSION || !parsed.accountData) return null;
    return parsed;
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
    accountData,
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
