import { FeaturesContext } from '../FeatureBouncer';
import { Check } from '../types/types';

export const UserAgentCheck = (match: string): Check => {
  return async (idx: string, context: FeaturesContext): Promise<[string, boolean]> => {
    if (!context) {
      throw new Error(`Check ${idx}: No context set; I need a request object`);
    }

    if (!context.request) {
      return [idx, false];
    }

    const userAgent = context.request.headers['user-agent'];
    const isMatch = (new RegExp(match)).test(userAgent || '');
    return [idx, isMatch];
  }
}
