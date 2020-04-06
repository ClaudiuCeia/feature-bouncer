import { IFeaturesContext } from '../FeatureBouncer';
import { Check } from '../types/types';

export const CookieCheck = (cookieName: string, match: string): Check => {
  return async (idx: string, context: IFeaturesContext) => {
    if (!context) {
      throw new Error(`Check ${idx}: No context set; I need a request object`);
    }

    if (!context.request) {
      return [idx, false];
    }

    const cookie = context.request.cookies[cookieName];
    const isMatch = (new RegExp(match)).test(cookie || '');
    return [idx, isMatch];
  }
}
