import { FeatureBouncer, FeaturesContext } from "../FeatureBouncer";
import { PercentageOfRequestsCheck } from '../checks/PercentageOfRequestsCheck';
import { v4 } from "uuid";
import { QueryStringCheck } from "../checks/QueryStringCheck";

describe('Test FeatureBouncer', () => {
  it('Doesn\'t log if debug not set', () => {
    const features = new FeatureBouncer({
      store: {},
      features: {
        test: {
          checks: {
            'test': PercentageOfRequestsCheck(50),
          },
        }
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    features.middleware({} as any, {}, () => { return; });
    features.get('test');
    expect(features.debug()).toEqual({});
  });

  it('Logs when debug set', () => {
    jest.spyOn(global.console, 'log').mockImplementation(() => { return; })

    const features = new FeatureBouncer({
      store: {},
      features: {
        test: {
          checks: {
            'test': PercentageOfRequestsCheck(50),
          },
        }
      },
      options: {
        debug: true,
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    features.middleware({} as any, {}, () => { return; });
    features.get('test');

    expect(features.debug()).toEqual(
      { "test": { "checks": null, "overrides": null } }
    );

    expect(console.log).toHaveBeenCalled();
  });

  it('Works with custom context', () => {
    const features = new FeatureBouncer({
      store: {},
      getContext: (request): FeaturesContext => ({
        key: v4(),
        request,
        values: {
          guid: 42,
        }
      }),
      features: {
        test: {
          checks: {
            'test': async (idx: string, context: FeaturesContext): Promise<[string, boolean]> => {
              return [idx, context.values.guid === 42];
            },
          },
        }
      }
    });

    expect(features.get('test')).toBeTruthy();
  });

  it('Throws on non-existing feature', async () => {
    let features = new FeatureBouncer({
      store: {},
      features: {
        test: {
          checks: {
            'test': PercentageOfRequestsCheck(50),
          },
        }
      }
    });

    try {
      await features.getX('foo');
    } catch(err) {
      expect(err.message).toBe("There's no feature named foo");
    }
    expect(features.debug()).toEqual({});

    features = new FeatureBouncer({
      store: {},
      options: {
        debug: true,
      },
      features: {
        test: {
          checks: {
            'test': PercentageOfRequestsCheck(50),
          },
        }
      }
    });

    features.get('foo');
    expect(features.debug()).toEqual({
      "foo": "There's no feature named foo",
    });
  });

  it('Test overrides', () => {
    const features = new FeatureBouncer({
      store: {},
      options: {
        debug: true,
      },
      features: {
        example: {
          checks: {
            'invalid': QueryStringCheck('foo', 'bar'),
          },
          overrides: {
            'rollout': PercentageOfRequestsCheck(100),
          },
        }
      }
    });

    expect(features.get('example')).toBeTruthy();
  });
});
