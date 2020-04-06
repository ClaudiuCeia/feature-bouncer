import { FeatureBouncer } from "../FeatureBouncer";
import { QueryStringCheck } from "../checks/QueryStringCheck";

const checkQS = async (
  request: any,
  param: string,
  value: string
) => {
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
      request as any,
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
      request as any,
      'foo',
      'bar'
    )).toBeFalsy();

    expect(await checkQS(
      requestNotSet as any,
      'foo',
      'bar'
    )).toBeFalsy();

  });

  it('Fails if no request', async () => {
    expect(await checkQS(
      null,
      'foo',
      'bar'
    )).toBeFalsy();

    expect(await checkQS(
      {},
      'foo',
      'bar'
    )).toBeFalsy();
  });
});
