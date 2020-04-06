import { IFeaturesContext } from "../FeatureBouncer";

/**
 * Every FeatureToggle is formed by multiple Checks AND-ed together. Overrides are also
 * Check instances.
 */
export type Check = ((idx: string, context: IFeaturesContext) => Promise<[string, boolean]>);

export interface IFeatureBouncerOptions {
  debug: boolean;
}
