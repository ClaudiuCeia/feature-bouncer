import { FeatureBouncer } from "../FeatureBouncer";
import { UserAgentCheck } from "../checks/UserAgentCheck";

const checkUA = async (
  request: any,
  param: string,
) => {
  const features = new FeatureBouncer({
    store: {},
    features: {
      test: {
        checks: {
          'test': UserAgentCheck(param),
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

const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36";
describe('Test UserAgentCheck', () => {
  it('Passes if user agent matches params', async () => {
    const request = {
      headers: {
        "user-agent": UA
      }
    };

    expect(await checkUA(
      request as any,
      'Linux',
    )).toBeTruthy();
  });

  it('Passes if user agent matches with regex', async () => {
    const request = {
      headers: {
        "user-agent": UA
      }
    };

    expect(await checkUA(
      request as any,
      'Chrome\/79\.',
    )).toBeTruthy();
  });

  it('Fails if request doesn\'t match params', async () => {
    const request = {
      query: {
        "user-agent": UA
      }
    };
    const requestNotSet = {};

    expect(await checkUA(
      request as any,
      'InternetExplorer',
    )).toBeFalsy();

    expect(await checkUA(
      requestNotSet as any,
      'Chrome\/78\.',
    )).toBeFalsy();

  });
});
