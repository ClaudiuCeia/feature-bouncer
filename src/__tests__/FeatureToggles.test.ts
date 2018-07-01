import { FeatureToggles } from "../FeatureToggles";
import { PercentageOfRequestsCheck } from '../Checks';

describe('Test FeatureToggles', () => {
  it('Doesn\'t log if debug not set', () => {
    const features = new FeatureToggles({
      store: {},
      features: {
        test: {
          checks: {
            'test': PercentageOfRequestsCheck(50),
          },
        }
      }
    });

    features.middleware({} as any, {}, () => { return; });
    features.get('test');
    expect(features.debug()).toEqual({});
  });

  it('Logs when debug set', () => {
    jest.spyOn(global.console, 'log').mockImplementation(() => { return; })

    const features = new FeatureToggles({
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

    features.middleware({} as any, {}, () => { return; });
    features.get('test');

    expect(features.debug()).toEqual(
      {"test": {"checks": null, "overrides": null}}
    );

    expect(console.log).toHaveBeenCalled();
  });
});
