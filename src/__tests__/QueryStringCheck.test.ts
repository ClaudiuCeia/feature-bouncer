import * as express from "express";
import { FeatureBouncer } from "../FeatureBouncer";
import { QueryStringCheck } from "../checks/QueryStringCheck";

const checkQS = async (
  request: express.Request,
  param: string,
  value: string
): Promise<boolean> => {
  const features = new FeatureBouncer({
    store: {},
    features: {
      test: {
        checks: {
          'test': QueryStringCheck(param, value),
        },
      }
    }
  });

  features.middleware(
    request,
    {},
    () => { return; }
  );

  return features.get('test');
}

describe('Test QueryStringCheck', () => {
  it('Passes if request matches params', async () => {
    const request = {
      query: {
        "foo": "bar"
      }
    };

    expect(await checkQS(
      request as express.Request,
      'foo',
      'bar'
    )).toBeTruthy();
  });

  it('Fails if request doesn\'t match params', async () => {
    const request = {
      query: {
        "foo": "baz"
      }
    };
    const requestNotSet = {};

    expect(await checkQS(
      request as express.Request,
      'foo',
      'bar'
    )).toBeFalsy();

    expect(await checkQS(
      requestNotSet as express.Request,
      'foo',
      'bar'
    )).toBeFalsy();

  });
});
