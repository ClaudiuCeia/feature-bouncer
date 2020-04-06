import * as express from "express";
import { FeatureBouncer } from "../FeatureBouncer";
import { PercentageOfRequestsCheck } from '../checks/PercentageOfRequestsCheck';

const checkPercentage = async (n: number): Promise<boolean> => {
  const features = new FeatureBouncer({
    store: {},
    features: {
      test: {
        checks: {
          'test': PercentageOfRequestsCheck(n),
        },
      }
    }
  });

  features.middleware(
    {} as express.Request,
    {},
    () => { return; }
  );

  return features.getX('test');
}

// These tests _might_ be flaky, maybe, in the sense that we might get
// false positives if the check fails rarer than 1 in 100 times.
describe('Test PercentageOfRequestsCheck', () => {
  it('Always passes for 100 percent', async () => {
    for (let i = 0; i < 100; i++) {
      expect(await checkPercentage(100)).toBeTruthy();
    }
  });

  it('Never passes for 0 percent', async () => {
    for (let i = 0; i < 100; i++) {
      expect(await checkPercentage(0)).toBeFalsy();
    }
  });

  it('Throws on too large values', async () => {
    expect.assertions(1);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return expect(PercentageOfRequestsCheck(101)('test', {} as any)).rejects.toBeTruthy();
  });

  it('Throws on negative values', async () => {
    expect.assertions(1);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return expect(PercentageOfRequestsCheck(-1)('test', {} as any)).rejects.toBeTruthy();
  });
});
