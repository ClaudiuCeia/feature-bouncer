import { IFeaturesContext } from './Features';
export declare type Check = ((idx: string, context: IFeaturesContext) => Promise<[string, boolean]>);
export declare const PercentageOfRequestsCheck: (percentage: number) => (idx: string, context: IFeaturesContext) => Promise<[string, boolean]>;
export declare const QueryStringCheck: (query: string, value: string) => (idx: string, context: IFeaturesContext) => Promise<[string, boolean]>;
