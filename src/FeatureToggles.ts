import * as express from 'express';
import { Check } from './Checks';
import { v4 } from 'uuid';

export interface IFeatureTogglesOptions {
  debug: boolean;
}

/**
 * A FeatureToggle is defined by a group of checks and overrides.
 * The overrides are useful for cases like cheatcodes (foo.com/?hasBetaAccess=true)
 * or allowing developers to pass all checks.
 */
export interface FeatureToggle {
  checks: IMap<Check>;
  overrides?: IMap<Check>;
}

/**
 * Most checks are context dependant. The checks included in the library
 * only depend on the Request object, but for your app you would probably want
 * to define checks which depend on user attributes or some other app-specific state.
 */
export interface IFeaturesContext {
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
  values?: any;
};

type FeatureOrCheck = FeatureToggle | Check;
export interface IMap<T extends FeatureOrCheck> {
  [key: string]: T;
}

/**
 * Main library entry point
 */
export class FeatureToggles {
  store: any;

  /**
   * The function used to generate the context. By default it sets a random uuid key
   * and passes on the Express request object.
   */
  getContext: ((request: express.Request) => IFeaturesContext);
  features: IMap<FeatureToggle>;

  /**
   * Debug FeatureToggles
   */
  private trace: any = {};

  private options: IFeatureTogglesOptions;
  private context: IFeaturesContext;

  constructor(params: {
    store: any,
    features: IMap<FeatureToggle>,
    getContext?: ((request: express.Request) => IFeaturesContext) | undefined,
    options?: IFeatureTogglesOptions
  }) {
    this.store = params.store;

    if (params.getContext) {
      this.getContext = params.getContext;
    } else {
      this.getContext = (request: express.Request) => {
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
    _: any,
    next: any
  ) => {
    this.context = this.getContext(request);
    next();
  }

  /* addFeature = (name: string, feature: FeatureToggle) => {
    this.features[name] = feature;
  } */

  /**
   * Get a FeatureToggle result, exceptions are _not_ silenced, you need a catch block
   */
  getX = async (name: string) => {

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

    /**
     * Get a FeatureToggle result, exceptions are silenced
     */
    res = this.getCheckGroup(checks, name, 'checks');

    if (this.options.debug) {
      console.log(this.trace);
    }

    return res;
  }

  get = async (name: string) => {
    return this.getX(name).catch(err => {
      if (this.options.debug) {
        this.trace[name].error = err;
        console.log(this.trace);
      }

      return false;
    })
  }

  /**
   * Get a debug trace to understand the results for every ToggleCheck so far
   */
  debug = () => {
    return this.trace;
  }

  private getCheckGroup = async (
    group: IMap<Check>,
    name: string,
    type: string
  ) => {
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
