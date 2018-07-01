import * as express from 'express';
import { Check } from './Checks';
export interface FeatureToggle {
    checks: IMap<Check>;
    overrides?: IMap<Check>;
}
export interface IFeaturesContext {
    key: string | number;
    request: express.Request;
    values?: any;
}
declare type FeatureOrCheck = FeatureToggle | Check;
export interface IMap<T extends FeatureOrCheck> {
    [key: string]: T;
}
export declare class FeatureToggles {
    store: any;
    getContext: ((request: express.Request) => IFeaturesContext);
    features: IMap<FeatureToggle>;
    trace: any;
    private context;
    constructor(params: {
        store: any;
        getContext?: ((request: express.Request) => IFeaturesContext) | undefined;
        features: IMap<FeatureToggle>;
    });
    middleware: (request: express.Request, _: any, next: any) => void;
    getX: (name: string) => Promise<boolean>;
    get: (name: string) => Promise<boolean>;
    debug: () => any;
    private getCheckGroup;
}
export {};
