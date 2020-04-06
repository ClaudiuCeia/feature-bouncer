import * as express from 'express';
import { v4 } from 'uuid';
import { Check, FeatureBouncerOptions } from './types/types';

/**
 * A FeatureToggle is defined by a group of checks and overrides.
 * The overrides are useful for cases like cheatcodes (foo.com/?hasBetaAccess=true)
 * or allowing developers to pass all checks.
 */
export interface FeatureToggle {
  checks: FeatureBouncerMap<Check>;
  overrides?: FeatureBouncerMap<Check>;
}

/**
 * Most checks are context dependant. The checks included in the library
 * only depend on the Request object, but for your app you would probably want
 * to define checks which depend on user attributes or some other app-specific state.
 */
export interface FeaturesContext {
  /**
   * The key is used for persisting the check results. By default we use a random uuid v4,
   * but you will probably want to set this to the user id for your app.
   */
  key: string | number;
  /**
   * The Express request object
   */
  request: express.Request;
  /**
   * Any app-specific values you might want to pass on.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  values?: any;
}

type FeatureOrCheck = FeatureToggle | Check;
export interface FeatureBouncerMap<T extends FeatureOrCheck> {
  [key: string]: T;
}

/**
 * Main library entry point
 */
export class FeatureBouncer {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  store: any;

  /**
   * The function used to generate the context. By default it sets a random uuid key
   * and passes on the Express request object.
   */
  getContext: ((request: express.Request) => FeaturesContext);
  features: FeatureBouncerMap<FeatureToggle>;

  /**
   * Debug FeatureBouncer
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private trace: any = {};

  private options: FeatureBouncerOptions;
  private context: FeaturesContext;

  constructor(params: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    store: any;
    features: FeatureBouncerMap<FeatureToggle>;
    getContext?: ((request: express.Request) => FeaturesContext) | undefined;
    options?: FeatureBouncerOptions;
  }) {
    this.store = params.store;

    if (params.getContext) {
      this.getContext = params.getContext;
    } else {
      this.getContext = (request: express.Request): FeaturesContext => {
        return {
          key: v4(),
          request
        }
      };
    }

    this.features = params.features;
    this.options = params.options || { debug: false };
  }

  middleware = (
    request: express.Request,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    next: any
  ): void => {
    this.context = this.getContext(request);
    next();
  }

  /* addFeature = (name: string, feature: FeatureToggle) => {
    this.features[name] = feature;
  } */

  /**
   * Get a FeatureToggle result, exceptions are _not_ silenced, you need a catch block
   */
  getX = async (name: string): Promise<boolean> => {

    if (this.options.debug) {
      this.trace[name] = {
        checks: null,
        overrides: null,
      };
    }

    const feature = this.features[name];
    if (!feature) {
      const err = `There's no feature named ${name}`;

      if (this.options.debug) {
        this.trace[name] = err;
      }

      throw new Error(err);
    }

    const { checks, overrides } = feature;
    let res = null;
    if (overrides) {
      const overridesResult = await this.getCheckGroup(
        overrides,
        name,
        'overrides',
      );

      if (overridesResult) {
        res = overridesResult;
      }
    }

    if (!res) {
      /**
       * Get a FeatureToggle result, exceptions are silenced
       */
      res = this.getCheckGroup(checks, name, 'checks');
    }

    if (this.options.debug) {
      console.log(this.trace);
    }

    return res;
  }

  get = async (name: string): Promise<boolean> => {
    let res = false;
    try {
      res = await this.getX(name)
    } catch (err) {
      return false;
    }

    return res;
  }

  /**
   * Get a debug trace to understand the results for every ToggleCheck so far
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debug = (): any => {
    return this.trace;
  }

  private getCheckGroup = async (
    group: FeatureBouncerMap<Check>,
    name: string,
    type: string
  ): Promise<boolean> => {
    const results = Object.keys(group).map((checkKey) => {
      const checkFunc = group[checkKey];
      return checkFunc(checkKey, this.context);
    });

    const resolvedResults = await Promise.all(results);

    for (const res of resolvedResults) {
      if (this.options.debug) {
        if (!this.trace[name][type]) {
          this.trace[name][type] = {};
        }

        this.trace[name][type][res[0]] = res[1];
      }

      if (!res[1]) {
        return false;
      }
    }

    return true;
  }
}
