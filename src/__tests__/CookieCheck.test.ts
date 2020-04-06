import * as express from "express";
import { FeatureBouncer } from "../FeatureBouncer";
import { CookieCheck } from "../checks/CookieCheck";

const checkCookie = async (
  request: express.Request,
  cookieName: string,
  match: string,
  shouldThrow = false,
): Promise<boolean> => {
  const features = new FeatureBouncer({
    store: {},
    features: {
      test: {
        checks: {
          'test': CookieCheck(cookieName, match),
        },
      }
    }
  });

  features.middleware(
    request,
    {},
    () => { return; }
  );

  return shouldThrow ? features.getX('test') : features.get('test');
}

describe('Test CookieCheck', () => {
  it('Passes if cookie matches params', async () => {
    const request = {
      cookies: {
        "cookieName": "cookie-value"
      }
    };

    expect(await checkCookie(
      request as express.Request,
      'cookieName',
      'cookie-value'
    )).toBeTruthy();
  });

  it('Passes if cookie matches with regex', async () => {
    const request = {
      cookies: {
        "cookieName": "1234"
      }
    };

    expect(await checkCookie(
      request as express.Request,
      'cookieName',
      '^[0-9]+$',
    )).toBeTruthy();
  });

  it('Fails if cookie name doesn\'t match', async () => {
    const request = {
      query: {
        "cookieName": "foo"
      }
    };

    expect(await checkCookie(
      request as express.Request,
      "badCookieName",
      'foo',
    )).toBeFalsy();
  });
});
