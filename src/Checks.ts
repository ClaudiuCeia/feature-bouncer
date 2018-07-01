import { IFeaturesContext } from './Features';

/**
 * Every FeatureToggle is formed by multiple Checks AND-ed together. Overrides are also
 * Check instances.
 */
export type Check = ((idx: string, context: IFeaturesContext) => Promise<[string, boolean]>);

export const PercentageOfRequestsCheck = (percentage: number): Check => {
  return async (idx: string, _: IFeaturesContext) => {
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

export const QueryStringCheck = (query: string, value: string): Check => {
  return async (idx: string, context: IFeaturesContext) => {
    if (!context) {
      throw new Error(`Check ${idx}: No context set; I need a request object`);
    }

    if (!context.request) {
      return [idx, false];
    }

    return [idx, context.request.query[query] === value];
  }
}
