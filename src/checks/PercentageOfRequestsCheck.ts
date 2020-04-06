import { Check } from '../types/types';

export const PercentageOfRequestsCheck = (percentage: number): Check => {
  return async (idx: string): Promise<[string, boolean]> => {
    if (percentage > 100 || percentage < 0) {
      throw new Error(`
        You can't gate ${idx} to ${percentage}% requests.
        Make sure you pass a value between 0 and 100
      `);
    }

    const n = percentage / 100;
    return [idx, (!!n && Math.random() <= n)];
  }
}

