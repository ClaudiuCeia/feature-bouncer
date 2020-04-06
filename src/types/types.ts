import { FeaturesContext } from "../FeatureBouncer";

/**
 * Every FeatureToggle is formed by multiple Checks AND-ed together. Overrides are also
 * Check instances.
 */
export type Check = ((idx: string, context: FeaturesContext) => Promise<[string, boolean]>);

export interface FeatureBouncerOptions {
  debug: boolean;
}
