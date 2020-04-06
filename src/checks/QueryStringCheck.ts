import { FeaturesContext } from '../FeatureBouncer';
import { Check } from '../types/types';

export const QueryStringCheck = (query: string, value: string): Check => {
  return async (idx: string, context: FeaturesContext): Promise<[string, boolean]> => {
    if (!context) {
      throw new Error(`Check ${idx}: No context set; I need a request object`);
    }

    if (!context.request) {
      return [idx, false];
    }

    return [idx, context.request.query[query] === value];
  }
}
